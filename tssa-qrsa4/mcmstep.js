module.exports = function(L, KvInv, R, zThetaI, ThetaI)
{
	const LKvInv = L.mul(KvInv);

	return ThetaI.add(
		LKvInv.mul(L.transpose()).invert().mul(LKvInv).mul(R.sub(zThetaI))
	);
};
