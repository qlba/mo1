function Z(x)
{
	return Number.isSafeInteger(x);
}

function N(x)
{
	return Z(x) && x > 0;
}

module.exports = {Z, N};
