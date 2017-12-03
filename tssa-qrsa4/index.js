const {MathMx} = require('../mx/math_mx');
const {Double} = require('../double');

// function MCM()
// {

// }

function MCMStep(L, KvInv, R, zThetaI, ThetaI)
{
	const LKvInv = L.mul(KvInv);

	return ThetaI.add(
		LKvInv.mul(L.transpose()).invert().mul(LKvInv).mul(R.sub(zThetaI))
	);
}


const R = new MathMx(1, 1);
R.setElement(0, 0, new Double(9));

const KvInv = new MathMx(1, 1);
KvInv.setElement(0, 0, new Double(1));

let ThetaI = new MathMx(1, 1);
ThetaI.setElement(0, 0, new Double(-1));

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

for (let i = 0; i < 10; i++)
{
	ThetaI = MCMStep(L(ThetaI), KvInv, R, zThetaI(ThetaI), ThetaI);

	console.log(ThetaI.toString());
}
