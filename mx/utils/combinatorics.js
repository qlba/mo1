function combinations(depth, min, max, acc, dst)
{
	acc = acc || [];
	dst = dst || [];

	if(depth === 0)
		dst.push(acc);
	else
		for(var i = min; i <= max - depth + 1; i++)
			combinations(depth - 1, i + 1, max, acc.concat([i]), dst);

	return dst;
}

module.exports = {combinations};
