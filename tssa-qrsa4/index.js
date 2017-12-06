const {MathMx} = require('../mx/math_mx');
const {Double} = require('../double');

const PERIOD = 7;
const PASSBAND = 60;
const Xk0 = 4710050;
const Yk0 = 4610000;
const VXk0 = 6000;
const VYk0 = -5000;
const X0 = 6378165;
const Y0 = 0;

const X0_initial_approx = 0;
const Y0_initial_approx = 0;
const DELTA = 1;


// function wrap(data)
// {
// 	return new MathMx(data.length, data[0].length).fill((_, i, j) => new Double(data[i][j]));
// }

// function unwrap(mx)
// {
// 	var array = new Array(mx.n).fill(0);

// 	array = array.map(() => new Array(mx.m));
	
// 	mx.fill((x, i, j) => {
// 		array[i][j] = x.a;
// 		return x;
// 	});

// 	return array;
// }

const {getGaugingPositions, getModelVector} = require('./satellite');

const gaugPos = getGaugingPositions({
	period: PERIOD,
	passband: PASSBAND,
	satelliteCoord: [Xk0, Yk0, VXk0, VYk0],
	targetCoord: [X0, Y0]
});

const modelVector = getModelVector(gaugPos, [X0, Y0]);


const N = modelVector.length;
const M = 2;


// const printf = require('printf');

// for (let i = 0; i < gaugPos.length; i++)
// 	process.stdout.write(printf('\t%2d:%02d %25d m/s\n',
// 		Math.floor(gaugPos[i].meta.t / 60),
// 		Math.floor(gaugPos[i].meta.t % 60),
// 		Math.floor(modelVector[i])
// 	));


const R = new MathMx(N, 1);
for (let i = 0; i < N; i++)
	R.setElement(i, 0, new Double(modelVector[i]));

const KvInv = new MathMx(N, N);
for (let i = 0; i < N; i++)
	KvInv.setElement(i, i, new Double(1));

let ThetaI = new MathMx(2, 1);
ThetaI.setElement(0, 0, new Double(X0_initial_approx));
ThetaI.setElement(1, 0, new Double(Y0_initial_approx));

for (let i = 0; i < 10; i++) // Stopping criterion: 10 iterations
{
	ThetaI = MCMStep(L(ThetaI), KvInv, R, zThetaI(ThetaI), ThetaI);

	console.log(`${i}: ${ThetaI}`);
}

function L(ThetaI)
{
	const L = new MathMx(1, 1);
	L.setElement(0, 0, ThetaI.getElement(0, 0).mul(new Double(2)));

	return L;
}

function zThetaI(ThetaI)
{
	const zThetaI = new MathMx(1, 1);
	zThetaI.setElement(0, 0, ThetaI.getElement(0, 0).mul(ThetaI.getElement(0, 0)));

	return zThetaI;
}
