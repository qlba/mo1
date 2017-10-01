function combinations(depth, min, max)
{
	return combinationsSubProc(depth, min, max, [], []);
}

function combinationsSubProc(depth, min, max, acc, dst)
{
	if(depth === 0)
		dst.push(acc);
	else
		for(var i = min; i <= max - depth + 1; i++)
			combinationsSubProc(depth - 1, i + 1, max, acc.concat([i]), dst);

	return dst;
}

module.exports = {combinations};
