var {N} = require('../utils/number_types'),
	{IAryth} = require('../utils/iaryth'),
	{is} = require('../utils/is');

class Mx
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
			throw new TypeError('value is not IAryth');

		this.data[i][j] = value;

		return this;
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

		var result = new Mx(m, n);

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
				result.setElement(i, j, this.getElement(i, j).clone());

		return result;
	}


	swapRows(i, j)
	{
		if(!this.validElement(i, 0) || !this.validElement(j, 0))
			throw new RangeError(`No such row: [${i}/${j}] in ${this.m}`);

		var buf = this.data[i];
		this.data[i] = this.data[j];
		this.data[j] = buf;
		
		return this;
	}

	multiplyRow(i, multiplicator)
	{
		var {m, n} = this;

		if(!this.validElement(i, 0))
			throw new RangeError(`No such row: [${i}] in ${m}`);

		for(var j = 0; j < n; j++)
			this.setElement(i, j, this.getElement(i, j).mul(multiplicator));
		
		return this;
	}

	addMultipliedRow(i, j, multiplicator)
	{
		var {m, n} = this;

		if(!this.validElement(i, 0) || !this.validElement(j, 0))
			throw new RangeError(`No such row: [${i}/${j}] in ${m}`);

		for(var k = 0; k < n; k++)
			this.setElement(j, k, 
				this.getElement(i, k)
					.mul(multiplicator)
					.add(this.getElement(j, k))
			);
			
		return this;
	}


	toBasicView(basicCols)
	{
		var {m, n} = this,
			self = this;

		basicCols.forEach(function(j)
		{
			if(!self.validElement(0, j))
				throw new RangeError(`No such column: [${j}] in ${n}`);
		});

		var basics = {};

		basicCols.forEach(function(j)
		{
			var i;

			for(i = 0; i < m; i++)
				if(basics[i] === undefined && !self.getElement(i, j).equal(0))
				{
					basics[i] = j;

					self.makeBasic(i, j);

					break;
				}
			
			if(i === m)
				throw new Error('Basic variable count exceeds matrix rank');
		});

		return basics;
	}

	makeBasic(i, j)
	{
		var {m} = this;

		this.multiplyRow(i, this.getElement(i, j).inv());
		
		for(var o = 0; o < m; o++)
			if(o !== i)
				this.addMultipliedRow(i, o, this.getElement(o, j).neg());

		return this;
	}


	simplex()
	{

	}

	hasValidBasicView()
	{
		var {m} = this;

		for(var i = 0; i < m - 1; i++)
			if(this.getElement(i, 0).less(this.getElement(i, 0).neg()))
				return false;

		return true;
	}


	validElement(i, j)
	{
		return N(i + 1) && N(j + 1) && i < this.m && j < this.n;
	}


	toString(elementFormat, typesetRatio = 2)
	{
		var {m, n} = this,
			i, j;

		var elements = new Array(m),
			maxLen = 0;

		for(i = 0; i < m; i++)
		{
			elements[i] = new Array(n);

			for(j = 0; j < n; j++)
			{
				elements[i][j] = this.getElement(i, j).toString(elementFormat);

				if(elements[i][j].length > maxLen)
					maxLen = elements[i][j].length;
			}
		}

		maxLen++;

		for(i = 0; i < m; i++)
			for(j = 0; j < n; j++)
				elements[i][j] = ' '.repeat(maxLen - elements[i][j].length) + elements[i][j];
		
		return elements.map(function(row)
		{
			return row.join('') + '\n'.repeat((maxLen + 1) / typesetRatio);
		}).join('');
	}
}

module.exports = {Mx};
