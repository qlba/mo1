var {GaussMx} = require('../gauss_mx');

class JordanMx extends GaussMx
{
	makeBasic(i, j)
	{
		var {m} = this;

		this.multiplyRow(i, this.getElement(i, j).inv());
		
		for(var o = 0; o < m; o++)
			if(o !== i)
				this.addMultipliedRow(i, o, this.getElement(o, j).neg());

		return this;
	}
}

module.exports = {JordanMx};
