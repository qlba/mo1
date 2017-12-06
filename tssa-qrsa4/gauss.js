function gauss(rounds, expval, stddev)
{
	var sum = 0;

	for(var i = 0; i < rounds; i++)
		sum += Math.random();

	return (sum - rounds / 2) * Math.sqrt(12 / rounds) * stddev + expval;
}

module.exports = gauss;
