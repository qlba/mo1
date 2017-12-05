const _ = require('lodash');
const rungecutta = require('./rungecutta');

// const PERIOD = 10;
// const PASSBAND = 60;
const EARTH_RADIUS = 6378165;
const EARTH_GRAVITY = 9.8;
// const Xk0 = 4710050;
// const Yk0 = 4610000;
// const VXk0 = 6000;
// const VYk0 = -5000;
// const X0 = 6378165;
// const Y0 = 0;

const GAMMA_MASS = - EARTH_GRAVITY * EARTH_RADIUS * EARTH_RADIUS;

const fs = [
	(t, x, y, vx, vy) => vx,
	(t, x, y, vx, vy) => vy,
	(t, x, y, vx, vy) => GAMMA_MASS * x / Math.pow(x * x + y * y, 3 / 2),
	(t, x, y, vx, vy) => GAMMA_MASS * y / Math.pow(x * x + y * y, 3 / 2)
];


function inbound([Xk, Yk], [X0, Y0], passband)
{
	const targetToSatellite = Math.atan2(Yk - Y0, Xk - X0);
	const earthToTarget = Math.atan2(Y0, X0);

	return Math.abs(targetToSatellite - earthToTarget) < Math.PI * passband / 180;
}

function radialSpeed([Xk, Yk, VXk, VYk], [X0, Y0])
{
	let Xn = X0 - Xk;
	let Yn = Y0 - Yk;
	let Ln = Math.sqrt(Xn * Xn + Yn * Yn);
	Xn /= Ln;
	Yn /= Ln;

	const radialSpeed = VXk * Xn + VYk * Yn;
}


function getPristineModel({period, passband, xk0, yk0, vxk0, vyk0, x0, y0})
{
	let satelliteCoord = [xk0, yk0, vxk0, vyk0], targetCoord = [x0, y0], now = 0, data = [];

	for (;; now += period)
	{
		if (inbound(satelliteCoord, targetCoord, passband))
			data.push({t: now, z: radialSpeed(satelliteCoord, targetCoord)});
		else if (data.length)
			break;

		satelliteCoord = rungecutta(fs, satelliteCoord, _.range(0, period + 1, 1));
	}
}

function commitFlight(ts, satelliteCoord)
{
	return rungecutta(fs, satelliteCoord, _.range(0, ts[0] + 1, 1));
}

function getModelVector(ts, satelliteCoord, targetCoord)
{
	const data = [];

	data.push({t: ts[0], z: radialSpeed(satelliteCoord, targetCoord)});

	for(let i = 1; i < satelliteCoord; i++)
		data.push({
			t: ts[i],
			z: radialSpeed(satelliteCoord = rungecutta(fs, satelliteCoord, _.range(ts[i - 1], ts[i] + 1, 1)), targetCoord)
		});
}


module.exports = function()


// module.exports = class
// {
// 	constructor(satelliteCoord, targetCoord)
// 	{
// 		let second = 0;

// 		for (;; second++)
// 		{
// 			satelliteCoord = _.last(rungecutta(fs, satelliteCoord, [0, 1]));
		
// 			if (Math.abs(angleToTarget(satelliteCoord, targetCoord)) <= Math.PI * PASSBAND / 180)
// 				break;
// 		}

// 		Object.assign(this, {
// 			second,
// 			satelliteCoord,
// 			targetCoord
// 		});
// 	}

// 	getModelVector()
// 	{

// 	}
// };

// let now = [Xk0, Yk0, VXk0, VYk0], second = 0;

// function init()
// {
// 	for (;; second++)
// 	{
// 		now = _.last(rungecutta(fs, now, [0, 1]));
	
// 		if (Math.abs(angleToTarget(now, [X0, Y0])) <= Math.PI * PASSBAND / 180)
// 			break;
// 	}
// }

// init();


// function getModelVector([Xk0, Yk0, VXk0, VYk0], [X0, Y0])
// {

// }



// // process.stdout.write(printf('%4s %22d:%02d %25s km %25s km %25s m/s %25s m/s\n', '--',
// // 	_.floor(second / 60),
// // 	second % 60,
// // 	Math.round(now[0] / 1000),
// // 	Math.round(now[1] / 1000),
// // 	Math.round(now[2]),
// // 	Math.round(now[3])
// // ));


// for(let index = 0;; second += PERIOD)
// {
// 	const [Xk, Yk, VXk, VYk] = now;
	
// 	if (Math.abs(angleToTarget(now, [X0, Y0])) > Math.PI * PASSBAND / 180)
// 		break;

// 	const earthAltitude = Math.round((Math.sqrt(Xk * Xk + Yk * Yk) - EARTH_RADIUS) / 1000);

// 	let Xn = X0 - Xk;
// 	let Yn = Y0 - Yk;
// 	let Ln = Math.sqrt(Xn * Xn + Yn * Yn);
// 	Xn /= Ln;
// 	Yn /= Ln;

// 	const radialSpeed = VXk * Xn + VYk * Yn;

// 	// logPosition(++index, second, Math.round(radialSpeed), Math.round(angle), earthAltitude, angle < 60);

// 	now = _.last(rungecutta(fs, now, _.range(0, PERIOD + 1, 0.01)));
// }

// // function logPosition(index, second, radialSpeed, angle, earthAltitude, keep)
// // {
// // 	process.stdout.write(printf('%4d %22d:%02d %25s m/s %25s\u00B0 %25s km%s',
// // 		index, _.floor(second / 60), second % 60, radialSpeed, angle, earthAltitude, keep ? '\n' : '\r'));
// // }
