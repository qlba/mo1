const _ = require('lodash');
const {MathMx} = require('../mx/math_mx');
const {Double} = require('../double');

const {getGaugingPositions, getModelVector} = require('./satellite');
const MCMStep = require('./mcmstep');
const gauss = require('./gauss');

const PERIOD = 10;
const PASSBAND = 60;
const SIGMA = 0.05;
const Xk0 = 4710050;
const Yk0 = 4610000;
const VXk0 = 6000;
const VYk0 = -5000;
const X0 = 6378165;
const Y0 = 0;

const EQUIP_COST = 1e5;
const GAUGE_COST = 1e3;

const EPSILON = 0.1;

const DELTA = 1;


const pareto = {};

try
{
	for (let PERIOD = 0.8; PERIOD >= 0.1; PERIOD -= 0.1)
	{
		const gaugPos = getGaugingPositions({
			period: PERIOD,
			passband: PASSBAND,
			satelliteCoord: [Xk0, Yk0, VXk0, VYk0],
			targetCoord: [X0, Y0]
		});
		
		const modelVector = getModelVector(gaugPos, [X0, Y0]);
		
		for (let i = 0; i < modelVector.length; i++)
			modelVector[i] += gauss(12, 0, SIGMA);
		
		const X0_initial_approx = (_.first(gaugPos).satelliteCoord[0] + _.last(gaugPos).satelliteCoord[0]) / 2;
		const Y0_initial_approx = (_.first(gaugPos).satelliteCoord[1] + _.last(gaugPos).satelliteCoord[1]) / 2;
		
		const N = modelVector.length;
		const K = 2;
		
		const R = new MathMx(N, 1);
		for (let i = 0; i < N; i++)
			R.setElement(i, 0, new Double(modelVector[i]));
		
		const KvInv = new MathMx(N, N);
		KvInv.fill(() => new Double(0));
		for (let i = 0; i < N; i++)
			KvInv.setElement(i, i, new Double(1 / (SIGMA * SIGMA)));
		
		let ThetaI = new MathMx(K, 1);
		ThetaI.setElement(0, 0, new Double(X0_initial_approx));
		ThetaI.setElement(1, 0, new Double(Y0_initial_approx));
		
		const printf = require('printf');
		
		// console.log(printf('%4d %25f %25f', 0, ThetaI.getElement(0, 0), ThetaI.getElement(1, 0)));
		
		let resultError;
		
		for (;;)
		{
			const MCMResult = MCMStep(L(ThetaI), KvInv, R, zThetaI(ThetaI), ThetaI);
			const nextTheta = MCMResult.ThetaI;
			
			const dx = nextTheta.data[0][0] - ThetaI.data[0][0];
			const dy = nextTheta.data[1][0] - ThetaI.data[1][0];
			const shift = Math.sqrt(dx * dx + dy * dy);
		
			ThetaI = nextTheta;
			// console.log(printf('%4d %25f %25f %25f', i + 1, ThetaI.getElement(0, 0), ThetaI.getElement(1, 0), shift));
		
			if (shift < EPSILON) {
				resultError = MCMResult.TError;
				break;
			}
		}
		
		// process.stdout.write('\n');
		
		// process.stdout.write(printf('%4s %25f %25f\n',
		// 	'E',
		// 	Math.abs(ThetaI.getElement(0, 0) - X0),
		// 	Math.abs(ThetaI.getElement(1, 0) - Y0)
		// ));
		
		// process.stdout.write(printf('%4s %25f %25f\n',
		// 	'L',
		// 	Math.sqrt(resultError.getElement(0, 0)),
		// 	Math.sqrt(resultError.getElement(1, 1))
		// ));
		
		// process.stdout.write('\n');
		
		// process.stdout.write(printf('%4s %25f\n',
		// 	'S',
		// 	Math.sqrt(resultError.getElement(0, 0).a + resultError.getElement(1, 1).a)
		// ));

		const cost = EQUIP_COST + N * GAUGE_COST;
		const prec = Math.sqrt(resultError.getElement(0, 0).a + resultError.getElement(1, 1).a);
		
		process.stdout.write(printf('%10.2f %25d %25f\n', PERIOD, cost, prec));

		pareto[cost] = !pareto[cost] ? prec : Math.min(pareto[cost], prec);

		function L(ThetaI)
		{
			const L = new MathMx(K, N);

			const thetas = new Array(K);

			for (let j = 0; j < K; j++)
				thetas[j] = ThetaI.getElement(j, 0).a;

			for (let j = 0; j < K; j++)
			{
				const thetas_fwd = thetas.slice();
				thetas_fwd[j] += DELTA;
				const z_fwd = getModelVector(gaugPos, thetas_fwd);

				const thetas_bwd = thetas.slice();
				thetas_bwd[j] -= DELTA;
				const z_bwd = getModelVector(gaugPos, thetas_bwd);

				for (let i = 0; i < N; i++)
					L.setElement(j, i, new Double((z_fwd[i] - z_bwd[i]) / (2 * DELTA)));
			}

			return L;
		}

		function zThetaI(ThetaI)
		{
			const thetas = new Array(K);

			for (let j = 0; j < K; j++)
				thetas[j] = ThetaI.getElement(j, 0).a;
			
			const zThetaI = getModelVector(gaugPos, thetas);
			const mx = new MathMx(N, 1);

			for (let i = 0; i < N; i++)
				mx.setElement(i, 0, new Double(zThetaI[i]));

			return mx;
		}
	}
}
catch (e) {}

for (let key in pareto)
	console.log(`${key}\t${pareto[key]}`);
