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


const PERIOD = 7;

for(;;)
{
	lastPosition = _.last(rungecutta([dx, dy, dvx, dvy], lastPosition, _.range(0, PERIOD, 0.1)));

	const angle = (Math.round(Math.atan2(lastPosition[1] - Y0, lastPosition[0] - X0) * 180 / Math.PI));

	if (angle < -60)
		break;
	else if (angle < 60)
	{
		const [Xk, Yk, VXk, VYk] = lastPosition;

		const earthAltitude = Math.round((Math.sqrt(Xk * Xk + Yk * Yk) - EARTH_RADIUS) / 1000);
		const earthAngle = (Math.round(Math.atan2(Yk, Xk) * 180 / Math.PI))
		const targetAngle = (Math.round(Math.atan2(Yk - Y0, Xk - X0) * 180 / Math.PI))

		logPosition(PERIOD * ++second, earthAltitude, earthAngle, targetAngle);
	}
}

function logPosition(second, earthAltitude, earthAngle, targetAngle)
{
	process.stdout.write(printf('%2d:%02d %25s km %25s\u00B0 %25s\u00B0\n',
		_.floor(second / 60), second % 60,
		earthAltitude,
		earthAngle,
		targetAngle
	));
}
