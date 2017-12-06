const _ = require('lodash');
const {MathMx} = require('../mx/math_mx');
const {Double} = require('../double');

const MCMStep = require('./mcmstep');

const PERIOD = 7;
const PASSBAND = 60;
const Xk0 = 4710050;
const Yk0 = 4610000;
const VXk0 = 6000;
const VYk0 = -5000;
const X0 = 6378165;
const Y0 = 1000;

const DELTA = 100;


const {getGaugingPositions, getModelVector} = require('./satellite');

const gaugPos = getGaugingPositions({
	period: PERIOD,
	passband: PASSBAND,
	satelliteCoord: [Xk0, Yk0, VXk0, VYk0],
	targetCoord: [X0, Y0]
});

const modelVector = getModelVector(gaugPos, [X0, Y0]);

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
	KvInv.setElement(i, i, new Double(1));

let ThetaI = new MathMx(K, 1);
ThetaI.setElement(0, 0, new Double(X0_initial_approx));
ThetaI.setElement(1, 0, new Double(Y0_initial_approx));

console.log(`${0}: ${ThetaI.data}`);

for (let i = 0; i < 10; i++)
{
	ThetaI = MCMStep(L(ThetaI), KvInv, R, zThetaI(ThetaI), ThetaI);

	console.log(`${i + 1}: ${ThetaI.data}`);
}

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
