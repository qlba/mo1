var {IAryth} = require('../mx/iaryth'),
	{is} = require('../utils/is'),
	sprintf = require('printf');

class Double extends IAryth
{
	constructor(a)
	{
		super();

		if(!is(Number)(a))
			throw new TypeError('a must be a number');
		
		this.a = a;
	}

	static add(lhs, rhs)
	{
		[lhs, rhs] = assertDouble(arguments);

		return new Double(lhs.a + rhs.a);
	}

	static sub(lhs, rhs)
	{
		[lhs, rhs] = assertDouble(arguments);
		
		return new Double(lhs.a - rhs.a);
	}

	static mul(lhs, rhs)
	{
		[lhs, rhs] = assertDouble(arguments);
		
		return new Double(lhs.a * rhs.a);
	}
	
	static div(lhs, rhs)
	{
		[lhs, rhs] = assertDouble(arguments);
		
		return new Double(lhs.a / rhs.a);
	}

	static neg(lhs)
	{
		[lhs] = assertDouble(arguments);

		return new Double(-lhs.a);
	}

	static inv(lhs)
	{
		[lhs] = assertDouble(arguments);
		
		return new Double(1 / lhs.a);
	}
	
	static equal(lhs, rhs)
	{
		[lhs, rhs] = assertDouble(arguments);

		return lhs.a === rhs.a;
	}

	static less(lhs, rhs)
	{
		[lhs, rhs] = assertDouble(arguments);

		return lhs.a < rhs.a;
	}

	static getOne()
	{
		return new Double(1);
	}

	static getZero()
	{
		return new Double(0);
	}

	static clone(lhs)
	{
		[lhs] = assertDouble(arguments);
		
		return new Double(lhs.a);
	}

	static toString(lhs, format)
	{
		if(format)
			return sprintf(format, lhs.a);
		else
			return `${lhs.a}`;
	}
}

function assertDouble(args)
{
	for(var i = 0; i < args.length; i++)
	{
		if(is(Number)(args[i]))
			args[i] = new Double(args[i], 1);

		if(!is(Double)(args[i]))
			throw new Error('All arguments must be Numbers or Doubles');
	}

	return args;
}

module.exports = {Double};
