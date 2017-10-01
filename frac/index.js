var {Z} = require('../utils/number_types'),
	{GCD, LCM} = require('./natural_math'),
	{IAryth} = require('../mx/iaryth'),
	{is} = require('../utils/is'),
	sprintf = require('printf'),
	{abs} = Math;

class Frac extends IAryth
{
	constructor(p, q)
	{
		super();

		if(!Z(p) || !Z(q))
			throw new TypeError('Fraction components must be Z-numbers');

		if(q === 0)
			throw new Error('Zero denominator');
		
		if(q < 0)
		{
			p = -p;
			q = -q;
		}

		if(p === 0)
			q = 1;
		else
		{
			var gcd = GCD(abs(p), q);
			p /= gcd;
			q /= gcd;
		}

		this.p = p;
		this.q = q;
	}

	static add(lhs, rhs)
	{
		[lhs, rhs] = assertFracs(arguments);

		var cd = LCM(lhs.q, rhs.q);

		return new Frac(
			lhs.p * (cd / lhs.q) + rhs.p * (cd / rhs.q),
			cd
		);
	}

	static sub(lhs, rhs)
	{
		[lhs, rhs] = assertFracs(arguments);

		return Frac.add(
			lhs,
			Frac.neg(rhs)
		);
	}

	static mul(lhs, rhs)
	{
		[lhs, rhs] = assertFracs(arguments);

		var gcd1 = GCD(abs(lhs.p) || 1, rhs.q),
			gcd2 = GCD(abs(rhs.p) || 1, lhs.q);

		return new Frac(
			(lhs.p / gcd1) * (rhs.p / gcd2),
			(lhs.q / gcd2) * (rhs.q / gcd1)
		);
	}
	
	static div(lhs, rhs)
	{
		[lhs, rhs] = assertFracs(arguments);

		return Frac.mul(
			lhs,
			Frac.inv(rhs)
		);
	}

	static neg(lhs)
	{
		[lhs] = assertFracs(arguments);

		return new Frac(-lhs.p, lhs.q);
	}

	static inv(lhs)
	{
		[lhs] = assertFracs(arguments);

		if(lhs.p === 0)
			throw new Error('Cannot invert zero fraction');

		return new Frac(lhs.q, lhs.p);
	}
	
	static equal(lhs, rhs)
	{
		[lhs, rhs] = assertFracs(arguments);

		return lhs.p === rhs.p && lhs.q === rhs.q;
	}

	static less(lhs, rhs)
	{
		[lhs, rhs] = assertFracs(arguments);

		if(lhs.p / lhs.q === rhs.p / rhs.q && !Frac.equal(lhs, rhs))
			throw new Error(
				`[Debug] Float aliasing: ${lhs.p} / ${lhs.q} === ${rhs.p} / ${rhs.q}`
			);

		return lhs.p / lhs.q < rhs.p / rhs.q;
	}

	static getOne()
	{
		return new Frac(1, 1);
	}

	static getZero()
	{
		return new Frac(0, 1);
	}

	static clone(lhs)
	{
		[lhs] = assertFracs(arguments);
		
		return new Frac(lhs.p, lhs.q);
	}

	static toString(lhs, format)
	{
		if(format)
			return sprintf(format, lhs.p / lhs.q);
		else if(lhs.p === 0)
			return '0';
		else if(lhs.q === 1)
			return `${lhs.p}`;
		else
			return `${lhs.p}/${lhs.q}`;
	}
}

function assertFracs(args)
{
	for(var i = 0; i < args.length; i++)
	{
		if(Z(args[i]))
			args[i] = new Frac(args[i], 1);

		if(!is(Frac)(args[i]))
			throw new Error('All arguments must be fractions or Z-numbers');
	}

	return args;
}

module.exports = {Frac};
