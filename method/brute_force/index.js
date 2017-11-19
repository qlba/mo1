var {SimplexTable} = require('../utils/simplex_table'),
	{CanonicalTask} = require('../canonical_task'),
	{combinations} = require('./utils/combinatorics'),
	{toBasicView} = require('../utils/to_basic_view'),
	{is} = require('../../utils/is');

function solveWithBruteForceMethod(task)
{
	if(!is(CanonicalTask)(task))
		throw new TypeError('Task must be CanonicalTask');

	var splx = new SimplexTable(task),
		best;

	combinations(task.equationsCount, 1, task.varsCount).forEach(combination =>
	{
		try
		{
			toBasicView(splx, combination);

			{
				var v, deathRow = splx.data[splx.data.length - 1].slice(1);

				for(v = 0; v < deathRow.length; v++)
					if(deathRow[v].isNegative())
						break;

				if(v === deathRow.length)
					console.log(splx.toString());
			}

			// console.log(splx.toString());
			// console.log(splx.getSolution().toString());

			var solution = splx.getSolution();

			for(var variable of solution.point)
				if(variable.isNegative())
				{
					// console.log('Invalid solution');
					return;
				}

			if(best === undefined || best.value.less(splx.getSolution().value))
				best = splx.getSolution();
		}
		catch(x)
		{
			console.log('Failure: ' + x.message);
		}
	});
	
	// console.log('Optimal solution: ' + best);

	return best;
}

module.exports = {solveWithBruteForceMethod};
