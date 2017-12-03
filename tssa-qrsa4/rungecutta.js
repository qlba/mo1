function rungecutta(fs, y0s, xs)
{
	const n = xs.length;
	const m = fs.length;
	
	const ys = new Array(m).fill(0).map(() => new Array(n));

	y0s.forEach((y0, j) => ys[j][0] = y0);


	const ks = new Array(m).fill(0).map(() => new Array(4));

	for (let i = 1; i < n; i++)
	{
		const h = xs[i] - xs[i - 1];

		for (let j = 0; j < m; j++)
			ks[j][0] = fs[j](xs[i - 1], ...ys.map(vs => vs[i - 1]));

		for (let j = 0; j < m; j++)
			ks[j][1] = fs[j](xs[i - 1] + h / 2, ...ys.map((vs, j) => vs[i - 1] + ks[j][0] * h / 2));

		for (let j = 0; j < m; j++)
			ks[j][2] = fs[j](xs[i - 1] + h / 2, ...ys.map((vs, j) => vs[i - 1] + ks[j][1] * h / 2));

		for (let j = 0; j < m; j++)
			ks[j][3] = fs[j](xs[i], ...ys.map((vs, j) => vs[i - 1] + ks[j][2] * h));

		for (let j = 0; j < m; j++)
			ys[j][i] = ys[j][i - 1] +
				h * (ks[j][0] + 2 * ks[j][1] + 2 * ks[j][2] + ks[j][3]) / 6;
	}

	return ys;
}


const _ = require('lodash');

console.time('calc');
const ys = rungecutta([
	(x, y1, y2, y3, y4) => y2,
	(x, y1, y2, y3, y4) => y3,
	(x, y1, y2, y3, y4) => y4,
	(x, y1, y2, y3, y4) => 1
],
[0, 0, 0, 0], _.range(0, 3, 0.00003));
console.timeEnd('calc');

console.log(ys.map(vs => _.last(vs)));
