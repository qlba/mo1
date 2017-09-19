var {N} = require('../utils/number_types'),
	{IAryth} = require('../utils/iaryth'),
	{is} = require('../utils/is'),
	{sprintf} = require('../utils/printf');

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
				if(basics[i] === undefined && !self.getElement(i, j).isZero())
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
		var basic = this.detectBasicView(),
			{m, n} = this;

		if(!basic)
			throw new Error('Matrix does not have basic view');

		if(!this.hasValidBasicView())
			throw new Error('Basic view is not valid');

		var next;

		console.log(this.toString());

		while((next = this.nextSimplex()))
		{
			console.log(`Basic ${next.j} instead of ${basic[next.i]} ` +
				`in row ${next.i}, old value ${this.getElement(m - 1, 0)}`);

			this.makeBasic(next.i, basic[next.i] = next.j);

			console.log(this.toString());
		}

		var point = new Array(n - 1).fill(0);

		for(var i = 0; i < m - 1; i++)
			point[basic[i] - 1] = this.getElement(i, 0);
		
		return {
			point,
			value: this.getElement(m - 1, 0),
		};
	}

	detectBasicView()
	{
		var {m, n} = this,
			basic = new Array(m - 1).fill(false);

		for(var j = 1; j < n; j++)
		{
			var one = this.isBasicColumn(j);

			if(one !== false)
				basic[one] = j;
		}

		return basic.includes(false) ? false : basic;
	}

	isBasicColumn(j)
	{
		var {m, n} = this;

		if(j === 0)
			throw new RangeError('Not a variable column');

		if(!this.validElement(0, j))
			throw new RangeError(`No such row [${j}] in Mx[${m}x${n}]`);

		var one = false;
		
		if(!this.getElement(m - 1, j).isZero())
			return false;

		for(var i = 0; i < m - 1; i++)
			if(one === false)
			{
				if(this.getElement(i, j).isOne())
					one = i;
				else if(!this.getElement(i, j).isZero())
					return false;
			}
			else if(!this.getElement(i, j).isZero())
				return false;

		return one;
	}

	hasValidBasicView()
	{
		var {m} = this;

		for(var i = 0; i < m - 1; i++)
			if(this.getElement(i, 0).isNegative())
				return false;

		return true;
	}

	nextSimplex()
	{
		var {m, n} = this;

		for(var j = 1; j < n; j++)
			if(this.getElement(m - 1, j).isNegative())
			{
				var U = null;

				for(var i = 0; i < m - 1; i++)
					if(
						this.getElement(i, j).isPositive()
						&&
						(
							U === null
							||
							(
								this.getElement(i, 0).div(this.getElement(i, j))
							).less(
								this.getElement(U, 0).div(this.getElement(U, j))
							)
						)
					)
						U = i;

				if(U === null)
					throw new Error('Value is not limited by the system');

				return {i: U, j};
			}

		return false;
	}




	validElement(i, j)
	{
		return N(i + 1) && N(j + 1) && i < this.m && j < this.n;
	}


	toString(elementFormat, typesetRatio = 2)
	{
		var {m, n} = this;

		var elements = new Array(m),
			maxLen = 0;

		for(var i = 0; i < m; i++)
		{
			elements[i] = new Array(n);

			for(var j = 0; j < n; j++)
			{
				elements[i][j] = this.getElement(i, j).toString(elementFormat);

				if(elements[i][j].length > maxLen)
					maxLen = elements[i][j].length;
			}
		}

		maxLen++;

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
				elements[i][j] = ' '.repeat(maxLen - elements[i][j].length) + elements[i][j];
		
		return elements.map(function(row)
		{
			return row.join('') + '\n'.repeat((maxLen + 1) / typesetRatio);
		}).join('');
	}
}

module.exports = {Mx};
