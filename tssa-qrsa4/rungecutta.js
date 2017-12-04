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
const EARTH_GRAVITY = 9.8;
const X0 = 6378165;
const Y0 = 0;
const Xk = 4710050;
const Yk = 4610000;
const VXk = 6000;
const VYk = -5000;

const GAMMA_MASS = - EARTH_GRAVITY * EARTH_RADIUS * EARTH_RADIUS;

const dx = (t, x, y, vx, vy) => vx;
const dy = (t, x, y, vx, vy) => vy;
const dvx = (t, x, y, vx, vy) => GAMMA_MASS * x / Math.pow(x * x + y * y, 3 / 2);
const dvy = (t, x, y, vx, vy) => GAMMA_MASS * y / Math.pow(x * x + y * y, 3 / 2);


let lastPosition = [Xk, Yk, VXk, VYk], second = 0;

logPosition(0, lastPosition, [X0, Y0], EARTH_RADIUS);


for (let i = 0, init = [Xk, Yk, VXk, VYk]; i < 30 * 60 / 10; i++)
	logPosition(
		10 * (i + 1),
		lastPosition = _.last(rungecutta([dx, dy, dvx, dvy], lastPosition, _.range(0, 10, 0.1))),
		[X0, Y0],
		EARTH_RADIUS
	);

function logPosition(second, [Xk, Yk, VXk, VYk], [X0, Y0], EARTH_RADIUS)
{
	const TIME = printf('%2d:%02d', _.floor(second / 60), second % 60);
	const EARTH_ALTITUDE = Math.round((Math.sqrt(Xk * Xk + Yk * Yk) - EARTH_RADIUS) / 1000).toString();
	const EARTH_AZIMUTH = (Math.round(Math.atan2(Yk, Xk) * 180 / Math.PI)).toString()
	const TARGET_ANGLE = (Math.round(Math.atan2(Yk - Y0, Xk - X0) * 180 / Math.PI)).toString()

	console.log(
		TIME.padStart(6) + ' ' +
		EARTH_ALTITUDE.padStart(25) + ' km' +
		EARTH_AZIMUTH.padStart(15) + '\u00B0 ' +
		TARGET_ANGLE.padStart(25) + '\u00B0 '
	);
}
