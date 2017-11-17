var {SimplexTable} = require('../utils/simplex_table'),
	{CanonicalTask} = require('../canonical_task'),
	{solveWithPureSimplexMethod} = require('../simplex/pure'),
	{toBasicView} = require('../utils/to_basic_view'),	
	{is} = require('../../utils/is');

function dualSimplex(task)
{
	if(!is(CanonicalTask)(task))
		throw new TypeError('Task must be CanonicalTask');

	var BaseType = task.coefficients[0][0].constructor;

	var newCoefficients = task.coefficients.map(eq =>
		eq.concat(new Array(task.equationsCount).fill(BaseType.getZero()))
	);

	for(var i = 0; i < task.equationsCount; i++)
		newCoefficients[i][task.varsCount + i] = BaseType.getOne();

	var newTargetFunctionCoefficients = task.targetFunctionCoefficients.concat(
		new Array(task.equationsCount).fill(BaseType.getZero())
	);
	
	var equatedTask = new CanonicalTask(
		task.varsCount + task.equationsCount,
		task.equationsCount,
		newCoefficients,
		task.freeMembers,
		newTargetFunctionCoefficients,
		task.targetFunctionFreeMember,
		task.varNames.concat(new Array(task.equationsCount).fill(0).map((_, i) => 'y' + (i + 1)))
	);

	var splx1 = new SimplexTable(task);
	var splx2 = new SimplexTable(equatedTask);

	console.log('Original task');
	console.log(splx1.toString());

	console.log('Equated task');
	console.log(splx2.toString());

	solveWithPureSimplexMethod(splx2);
	
	console.log('Solved equated task');
	console.log(splx2.toString());

	console.log('Solution');
	console.log(splx2.getDualSolution().toString());

	// if(res.value.isNegative())
	//     throw new Error('System has no solutions');

	// for(var i = 0; i < task.equationsCount; i++)
	// 	if(splx2.basic[i] < task.equationsCount)
	// 	{
	// 		var basicXs = {};

	// 		for(var ii = 0; ii < task.equationsCount; ii++)
	// 			basicXs[splx2.basic[ii]] = true;

	// 		var j;

	// 		for(j = task.equationsCount; j < task.equationsCount + task.varsCount; j++)
	// 			if(!basicXs[j])
	// 			{
	// 				splx2.makeBasic(i, j);
	// 				break;
	// 			}

	// 		if(j === task.equationsCount + task.varsCount)
	// 			throw new Error(`Cannot make variable y${splx2.basic[i]} free`);
	// 	}

	// var splx3 = new SimplexTable(task);

	// toBasicView(splx3, splx2.basic.map(x => x - task.equationsCount));	

	// // console.log(splx3.toString());

	// return solveWithPureSimplexMethod(splx3);
}

module.exports = {dualSimplex};
