var {SimplexTable} = require('../utils/simplex_table'),
	{CanonicalTask} = require('../canonical_task'),
	{toBasicView} = require('../utils/to_basic_view'),	
	{is} = require('../../utils/is');

function gradualSimplex(task, basic)
{
	if(!is(CanonicalTask)(task))
		throw new TypeError('Task must be CanonicalTask');

	var splx = new SimplexTable(task);

	toBasicView(splx, basic || new Array(task.equationsCount).fill(0).map((_, i) => i + 1));

	for(;;) {
		console.log(splx.toString());

		var {m, n} = splx, v, e;

		for(v = 1; v < n; v++)
			if(splx.getElement(m - 1, v).isNegative())
				throw new Error('Basic view is not a valid pseudoplan');

		var k, min = null;

		for(e = 0; e < m - 1; e++)
			if(!min || splx.getElement(e, 0).less(min))
				min = splx.getElement(k = e, 0);

		if(!min.isNegative())
			break;

		var j0, max = null;

		for(v = 1; v < n; v++)
			if(splx.getElement(k, v).isNegative())
				if(!max || max.less(splx.getElement(m - 1, v).div(splx.getElement(k, v))))
					max = splx.getElement(m - 1, j0 = v).div(splx.getElement(k, v));

		if(!max)
			throw new Error('Task is inconsistent');

		splx.makeBasic(k, j0);
	}

	return splx.getDualSolution().toString();
}

module.exports = {gradualSimplex};
