var {SimplexTable} = require('../../utils/simplex_table'),
	{CanonicalTask} = require('../../canonical_task'),
	{is} = require('../../../utils/is');

function solveWithPureSimplexMethod(task)
{
	var splx, step;

	if(is(CanonicalTask)(task))
		splx = new SimplexTable(task);
	else if(is(SimplexTable)(task))
		splx = task;
	else
		throw new TypeError('Task must be CanonicalTask or SimplexTable');

	splx.basic = detectValidBasicView(splx);
	
	if(!splx.basic)
		throw new Error('Matrix does not have valid basic view');

	console.log(splx.toString());
	console.log(splx.getSolution().toString());
		
	while((step = simplexStep(splx)))
	{
		splx.makeBasic(step.i, step.j);
		
		console.log(splx.toString());
		console.log(splx.getSolution().toString());
	}

	return Object.assign(splx.getSolution(), {
		meta: {
			splx,
			solution: {
				tables: [],
				steps: [],
				toString: function(elementFormat, typesetRatio = 2)
				{

				}
			}
		}
	});
}

module.exports = {solveWithPureSimplexMethod};


function simplexStep(splx)
{
	var {m, n} = splx, v, e;

	for(var j = 1; j < n; j++)
		if(v === undefined ||
			splx.getElement(m - 1, j).less(splx.getElement(m - 1, v))
		)
			v = j;

	if(splx.getElement(m - 1, v).isNegative())
	{
		for(var i = 0; i < m - 1; i++)
			if(splx.getElement(i, v).isPositive() && (
				e === undefined ||
				(
					splx.getElement(i, 0).div(splx.getElement(i, v))
				).less(
					splx.getElement(e, 0).div(splx.getElement(e, v))
				)
			))
				e = i;

		if(e === undefined)
			throw new Error('Value is not limited by the system');

		return {i: e, j: v};
	}

	return false;
}


function detectValidBasicView(splx)
{
	var {m} = splx,
		basicView = detectBasicView(splx);

	if(basicView === false)
		return false;

	for(var i = 0; i < m - 1; i++)
		if(splx.getElement(i, 0).isNegative())
			return false;

	return basicView;
}

function detectBasicView(splx)
{
	var {m, n} = splx,
		basic = new Array(m - 1).fill(false);

	for(var j = 1; j < n; j++)
	{
		var one = isBasicColumn(splx, j);

		if(one !== false)
			splx.basic[one] = basic[one] = j;
	}

	return basic.includes(false) ? false : basic;
}

function isBasicColumn(splx, j)
{
	var {m, n} = splx;

	if(j === 0)
		throw new RangeError('Not a variable column');

	if(!splx.validElement(0, j))
		throw new RangeError(`No such column [${j}] in Mx[${m}x${n}]`);

	var one = false;
	
	if(!splx.getElement(m - 1, j).isZero())
		return false;

	for(var i = 0; i < m - 1; i++)
		if(one === false)
		{
			if(splx.getElement(i, j).isOne())
				one = i;
			else if(!splx.getElement(i, j).isZero())
				return false;
		}
		else if(!splx.getElement(i, j).isZero())
			return false;

	return one;
}
