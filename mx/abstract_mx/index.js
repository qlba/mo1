var {N} = require('../../utils/number_types'),
	{IAryth} = require('../iaryth'),
	{is} = require('../../utils/is'),
	{tprintf} = require('../../utils/tprintf');

class AbstractMx
{
	constructor(m, n)
	{
		if(!N(m) || !N(n))
			throw new TypeError('Matrix dimensions must be natural numbers');

		this.data = new Array(m);

		for(var i = 0; i < m; i++)
			this.data[i] = new Array(n);

		this.m = m;
		this.n = n;
	}

	fill(callback)
	{
		var {m, n} = this;

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
				this.setElement(i, j, callback(
					this.getElement(i, j), i, j, this
				));
			
		return this;
	}

	clone()
	{
		var {m, n} = this;

		var result = new AbstractMx(m, n);

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
				result.setElement(i, j, this.getElement(i, j).clone());

		return result;
	}

	getElement(i, j)
	{
		var {m, n} = this;

		if(!this.validElement(i, j))
			throw new RangeError(`No such element: [${i}x${j}] in Mx[${m}x${n}]`);

		return this.data[i][j];
	}

	setElement(i, j, value)
	{
		var {m, n} = this;

		if(!this.validElement(i, j))
			throw new RangeError(`No such element: [${i}x${j}] in Mx[${m}x${n}]`);

		if(!is(IAryth)(value))
			throw new TypeError('Value is not IAryth');

		this.data[i][j] = value;

		return this;
	}

	toString(elementFormat, typesetRatio = 2)
	{
		return tprintf(
			this.data.map(
				row => row.map(
					element => element.toString(elementFormat)
				)
			),
			typesetRatio
		);
	}

	validElement(i, j)
	{
		return N(i + 1) && N(j + 1) && i < this.m && j < this.n;
	}
}

module.exports = {AbstractMx};
