function rungecutta(fs, y0s, xs)
{
	const n = xs.length;
	const m = fs.length;
	
	const ys = new Array(n).fill(0).map(() => new Array(m));

	y0s.forEach((y0, j) => ys[0][j] = y0);


	const ks = new Array(m).fill(0).map(() => new Array(4));

	for (let i = 1; i < n; i++)
	{
		const h = xs[i] - xs[i - 1];

		for (let j = 0; j < m; j++)
			ks[j][0] = fs[j](xs[i - 1], ...ys[i - 1]);

		for (let j = 0; j < m; j++)
			ks[j][1] = fs[j](xs[i - 1] + h / 2, ...ys[i - 1].map((y, j) => y + ks[j][0] * h / 2));

		for (let j = 0; j < m; j++)
			ks[j][2] = fs[j](xs[i - 1] + h / 2, ...ys[i - 1].map((y, j) => y + ks[j][1] * h / 2));

		for (let j = 0; j < m; j++)
			ks[j][3] = fs[j](xs[i], ...ys[i - 1].map((y, j) => y + ks[j][2] * h));

		for (let j = 0; j < m; j++)
			ys[i][j] = ys[i - 1][j] +
				h * (ks[j][0] + 2 * ks[j][1] + 2 * ks[j][2] + ks[j][3]) / 6;
	}

	return ys;
}


const printf = require('printf');
const _ = require('lodash');

const EARTH_RADIUS = 6378165;
const EARTH_GRAVITY = -9.8 * EARTH_RADIUS * EARTH_RADIUS;
const X0 = -4610050;
const Y0 = 4710000;
// const VX0 = 5000;
// const VY0 = 6000;
const VX0 = 5522;
const VY0 = 5522;

const dx = (t, x, y, vx, vy) => vx;
const dy = (t, x, y, vx, vy) => vy;
const dvx = (t, x, y, vx, vy) => EARTH_GRAVITY * x / Math.pow(x * x + y * y, 3 / 2);
const dvy = (t, x, y, vx, vy) => EARTH_GRAVITY * y / Math.pow(x * x + y * y, 3 / 2);


logPosition(0, X0, Y0);

for (let i = 0, init = [X0, Y0, VX0, VY0]; i < 3 * 60; i++)
{
	const ys = rungecutta([dx, dy, dvx, dvy], init, _.range(0, 60, 1));

	logPosition(1 * (i + 1), _.last(ys)[0], _.last(ys)[1]);

	init = _.last(ys);
}

function logPosition(minute, XH, YH)
{
	console.log(
		printf('%2d:%02d', _.floor(minute / 60), minute % 60).padStart(6) + ' ' +
		(
			Math.round(Math.atan2(YH, XH) * 180 / Math.PI)
		).toString().padStart(25) + '\u00B0 ' +

		(
			Math.round(Math.atan2(YH, XH - EARTH_RADIUS) * 180 / Math.PI)
		).toString().padStart(25) + '\u00B0 ' +

		(
			Math.round((Math.sqrt(XH * XH + YH * YH) - EARTH_RADIUS) / 1000)
		).toString().padStart(25) + ' km'
	);
}
