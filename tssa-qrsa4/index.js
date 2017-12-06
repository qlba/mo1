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

// console.dir(gaugPos);

const modelVector = getModelVector(gaugPos, [X0, Y0]);

// console.dir(modelVector);

const printf = require('printf');

for (let i = 0; i < gaugPos.length; i++)
	process.stdout.write(printf('\t%2d:%02d %25d m/s\n',
		Math.floor(gaugPos[i].meta.t / 60),
		Math.floor(gaugPos[i].meta.t % 60),
		Math.floor(modelVector[i])
	));




// const R = new MathMx(1, 1);
// R.setElement(0, 0, new Double(9));

// const KvInv = new MathMx(1, 1);
// KvInv.setElement(0, 0, new Double(1));

// let ThetaI = new MathMx(1, 1);
// ThetaI.setElement(0, 0, new Double(-1));

// function L(ThetaI)
// {
// 	const L = new MathMx(1, 1);
// 	L.setElement(0, 0, ThetaI.getElement(0, 0).mul(new Double(2)));

// 	return L;
// }

// function zThetaI(ThetaI)
// {
// 	const zThetaI = new MathMx(1, 1);
// 	zThetaI.setElement(0, 0, ThetaI.getElement(0, 0).mul(ThetaI.getElement(0, 0)));

// 	return zThetaI;
// }

// for (let i = 0; i < 10; i++)
// {
// 	ThetaI = MCMStep(L(ThetaI), KvInv, R, zThetaI(ThetaI), ThetaI);

// 	console.log(`${i}: ${ThetaI}`);
// }
