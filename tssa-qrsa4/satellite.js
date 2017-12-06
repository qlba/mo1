const _ = require('lodash');
const rungecutta = require('./rungecutta');

const EARTH_RADIUS = 6378165;
const EARTH_GRAVITY = 9.8;

const GAMMA_MASS = - EARTH_GRAVITY * EARTH_RADIUS * EARTH_RADIUS;

const fs = [
	(t, x, y, vx, vy) => vx,
	(t, x, y, vx, vy) => vy,
	(t, x, y, vx, vy) => GAMMA_MASS * x / Math.pow(x * x + y * y, 3 / 2),
	(t, x, y, vx, vy) => GAMMA_MASS * y / Math.pow(x * x + y * y, 3 / 2)
];


function radialSpeed([xk, yk, vxk, vyk], [x0, y0])
{
	let Xn = x0 - xk;
	let Yn = y0 - yk;
	let Ln = Math.sqrt(Xn * Xn + Yn * Yn);
	Xn /= Ln;
	Yn /= Ln;

	return vxk * Xn + vyk * Yn;
}

function inBand([xk, yk], [x0, y0], passband)
{
	const targetToSatellite = Math.atan2(yk - y0, xk - x0);
	const earthToTarget = Math.atan2(y0, x0);

	return Math.abs(targetToSatellite - earthToTarget) < Math.PI * passband / 180;
}


function getGaugingPositions({period, passband, satelliteCoord, targetCoord})
{
	let t = 0, positions = [];

	for (;; t += period)
	{
		if (inBand(satelliteCoord, targetCoord, passband))
			positions.push({satelliteCoord, meta: {t}});
		else if (positions.length)
			break;

		satelliteCoord = rungecutta(fs, satelliteCoord, _.range(0, period + 1, 1));
	}

	return positions;
}

function getModelVector(gaugingPositions, targetCoord)
{
	return gaugingPositions.map(({satelliteCoord}) => radialSpeed(satelliteCoord, targetCoord));
}


module.exports = {getGaugingPositions, getModelVector};
