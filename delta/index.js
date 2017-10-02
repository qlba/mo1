var seed = null;

function random()
{
//	if(seed === null)
//		return seed = new Date() % 65536;
//	else
//		return (seed = (seed + 1) * 75 % 65537 - 1) / 65536;
	
	return Math.random();
}

function delta(sigma)
{
	var sum = 0;

	for(var i = 0; i < 6; i++)
		sum += random() - 0.5;

	return sigma * Math.SQRT2 * sum;
}

module.exports = {delta};
