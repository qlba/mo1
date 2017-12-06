module.exports = function(fs, y0s, xs)
{
	const n = xs.length;
	const m = fs.length;
	
	const ys = new Array(m);

	y0s.forEach((y0, j) => ys[j] = y0);

	const ks = new Array(m).fill(0).map(() => new Array(4));

	for (let i = 1; i < n; i++)
	{
		const h = xs[i] - xs[i - 1];

		for (let j = 0; j < m; j++)
			ks[j][0] = fs[j](xs[i - 1], ...ys);

		for (let j = 0; j < m; j++)
			ks[j][1] = fs[j](xs[i - 1] + h / 2, ...ys.map((y, j) => y + ks[j][0] * h / 2));

		for (let j = 0; j < m; j++)
			ks[j][2] = fs[j](xs[i - 1] + h / 2, ...ys.map((y, j) => y + ks[j][1] * h / 2));

		for (let j = 0; j < m; j++)
			ks[j][3] = fs[j](xs[i], ...ys.map((y, j) => y + ks[j][2] * h));

		for (let j = 0; j < m; j++)
			ys[j] = ys[j] +
				h * (ks[j][0] + 2 * ks[j][1] + 2 * ks[j][2] + ks[j][3]) / 6;
	}

	return ys;
};
