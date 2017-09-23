class IAryth
{
	add(rhs)
	{
		return this.constructor.add(this, rhs);
	}

	sub(rhs)
	{
		return this.constructor.sub(this, rhs);
	}

	mul(rhs)
	{
		return this.constructor.mul(this, rhs);
	}

	div(rhs)
	{
		return this.constructor.div(this, rhs);
	}

	neg()
	{
		return this.constructor.neg(this);
	}

	inv()
	{
		return this.constructor.inv(this);
	}
	
	equal(rhs)
	{
		return this.constructor.equal(this, rhs);
	}

	less(rhs)
	{
		return this.constructor.less(this, rhs);
	}

	isOne()
	{
		return this.constructor.isOne(this);
	}

	isZero()
	{
		return this.constructor.isZero(this);
	}

	isNegative()
	{
		return this.constructor.isNegative(this);
	}

	isPositive()
	{
		return this.constructor.isPositive(this);
	}

	clone()
	{
		return this.constructor.clone(this);
	}

	toString(format)
	{
		return this.constructor.toString(this, format);
	}

	static add()
	{
		throw new Error('Not implemented');
	}

	static sub()
	{
		throw new Error('Not implemented');
	}

	static mul()
	{
		throw new Error('Not implemented');
	}

	static div()
	{
		throw new Error('Not implemented');
	}
	
	static neg()
	{
		throw new Error('Not implemented');
	}
	
	static inv()
	{
		throw new Error('Not implemented');
	}
	
	static equal()
	{
		throw new Error('Not implemented');
	}
	
	static less()
	{
		throw new Error('Not implemented');
	}

	static clone()
	{
		throw new Error('Not implemented');
	}

	static isOne(lhs)
	{
		return !lhs.isZero() && lhs.inv().equal(lhs);
	}

	static isZero(lhs)
	{
		return lhs.neg().equal(lhs);
	}

	static isNegative(lhs)
	{
		return lhs.less(lhs.neg());
	}

	static isPositive(lhs)
	{
		return lhs.neg().less(lhs);
	}
	
	static toString()
	{
		throw new Error('Not implemented');
	}
}

module.exports = {IAryth};
