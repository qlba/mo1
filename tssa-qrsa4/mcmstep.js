module.exports = function(L, KvInv, R, zThetaI, ThetaI)
{
	const LKvInv = L.mul(KvInv);
	const TError = LKvInv.mul(L.transpose()).invert();

	return {
		ThetaI: ThetaI.add(TError.mul(LKvInv).mul(R.sub(zThetaI))),
		TError
	};
};
