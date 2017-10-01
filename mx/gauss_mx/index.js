var {AbstractMx} = require('../abstract_mx');

class GaussMx extends AbstractMx
{
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

	swapRows(i, j)
	{
		if(!this.validElement(i, 0) || !this.validElement(j, 0))
			throw new RangeError(`No such row: [${i}/${j}] in ${this.m}`);

		var buf = this.data[i];
		this.data[i] = this.data[j];
		this.data[j] = buf;
		
		return this;
	}
}

module.exports = {GaussMx};
