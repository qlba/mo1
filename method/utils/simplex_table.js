var {CanonicalTask} = require('../canonical_task'),
	{JordanMx} = require('../../mx/jordan_mx'),
	{is} = require('../../utils/is'),
	{tprintf} = require('../../utils/tprintf');

class SimplexTable extends JordanMx
{
	constructor(task)
	{
		if(!is(CanonicalTask)(task))
			throw new TypeError('Input must be CanonicalTask');

		super(task.equationsCount + 1, task.varsCount + 1);

		var i, j;

		for(i = 0; i < task.equationsCount; i++)
			this.setElement(i, 0, task.freeMembers[i]);

		this.setElement(task.equationsCount, 0, task.targetFunctionFreeMember);

		for(i = 0; i < task.equationsCount; i++)
			for(j = 0; j < task.varsCount; j++)
				this.setElement(i, j + 1, task.coefficients[i][j]);

		for(j = 0; j < task.varsCount; j++)
			this.setElement(task.equationsCount, j + 1, task.targetFunctionCoefficients[j].neg());

		Object.assign(this, {
			varsCount: task.varsCount,
			equationsCount: task.equationsCount,
			varNames: task.varNames
		});

		this.basic = new Array(task.equationsCount).fill(false);
	}

	makeBasic(i, j)
	{
		this.basic[i] = j;

		return JordanMx.prototype.makeBasic.call(this, i, j);
	}

	getSolution()
	{
		var point = new Array(this.varsCount).fill(
			this.data[0][0].sub(this.data[0][0])
		);

		for(var i = 0; i < this.equationsCount; i++)
		{
			if(this.basic[i] === false)
				throw new Error('Basic variables are unknown');

			point[this.basic[i] - 1] = this.data[i][0];
		}

		return {
			point,
			value: this.data[this.equationsCount][0],

			toString: function(elementFormat)
			{
				return 'Z(' + this.point.map(
					p => p.toString(elementFormat)
				).join('; ') + ') = ' + this.value.toString(elementFormat);
			}
		};
	}

	toString(elementFormat, typesetRatio = 2)
	{
		var {m} = this, strings = new Array();

		strings.push(['BV', 'FM'].concat(this.varNames));

		var basic = this.basic.map(v =>
			v === false ? '??' : this.varNames[v - 1]
		).concat(['z']);

		for(var i = 0; i < m; i++)
			strings.push([basic[i]].concat(this.data[i].map(
				element => element.toString(elementFormat)
			)));

		return tprintf(strings, typesetRatio);
	}
}

module.exports = {SimplexTable};
