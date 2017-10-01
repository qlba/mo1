var {SimplexTable} = require('../../utils/simplex_table'),
	{CanonicalTask} = require('../../canonical_task'),
	{solveWithPureSimplexMethod} = require('../pure'),
	{toBasicView} = require('../../utils/to_basic_view'),	
	{is} = require('../../../utils/is');

var maxAttempts = 3;

function solveWithBigFinesMethod(task)
{
	if(!is(CanonicalTask)(task))
		throw new TypeError('Task must be CanonicalTask');

	var BaseType = task.coefficients[0][0].constructor;

	for(var i = 0; i < task.equationsCount; i++)
		if(task.freeMembers[i].less(BaseType.getZero()))
		{
			task.freeMembers[i] = task.freeMembers[i].neg();

			for(j = 0; j < task.varsCount; j++)
				task.coefficients[i][j] = task.coefficients[i][j].neg();
		}

	var newCoefficients = task.coefficients.map(coeffs =>
		new Array(task.equationsCount).fill(BaseType.getZero()).concat(coeffs)
	);

	for(var i = 0; i < task.equationsCount; i++)
		newCoefficients[i][i] = BaseType.getOne();

	var M = estimateM(task);

	var splx2;

	for(var attempts = 0; attempts < maxAttempts; attempts++, M = M.mul(10))
	{
		// console.log(`${attempts + 1}: M = ${M}`);

		var newTargetFunctionCoefficients = new Array(task.equationsCount)
			.fill(M.neg())
			.concat(task.targetFunctionCoefficients);

		var artificialBasicTask = new CanonicalTask(
			task.varsCount + task.equationsCount,
			task.equationsCount,
			newCoefficients,
			task.freeMembers,
			newTargetFunctionCoefficients,
			task.targetFunctionFreeMember,
			new Array(task.equationsCount).fill(0).map((_, i) => 'y' + (i + 1)).concat(task.varNames)
		);

		splx2 = new SimplexTable(artificialBasicTask);

		// console.log(splx1.toString());

		for(var i = 0; i < task.equationsCount; i++)
			splx2.makeBasic(i, i + 1);

		// console.log(splx2.toString());

		var res = solveWithPureSimplexMethod(splx2);

		// console.log(res.toString());
		// console.log(splx2.toString());

		// if(res.value.isNegative())
		// 	throw new Error('System has no solutions');

		for(var i = 0; i < task.equationsCount; i++)
			if(splx2.basic[i] < task.equationsCount)
				continue;

		break;
	}

	var splx3 = new SimplexTable(task);

	// console.log(splx2.toString());
	// console.log(splx3.toString());

	toBasicView(splx3, splx2.basic.map(x => x - task.equationsCount));
	
	// for(var i = 0; i < task.equationsCount; i++)
	// 	splx3.makeBasic(i, splx2.basic[i] - task.equationsCount);

	// console.log(splx3.toString());

	return splx3.getSolution();
}

function estimateM(task)
{
	var BaseType = task.coefficients[0][0].constructor,
		allNumbers = [];

	task.coefficients.forEach(row => row.forEach(number =>
	{
		allNumbers.push(number);
	}));

	task.freeMembers.forEach(number =>
	{
		allNumbers.push(number);
	});
	
	task.targetFunctionCoefficients.forEach(number =>
	{
		allNumbers.push(number);
	});

	allNumbers.push(task.targetFunctionFreeMember);


	return maxIaryth(allNumbers).mul(10);
}

function maxIaryth(array)
{
	var max = undefined;

	array.forEach(function(iaryth)
	{
		if(!max || max.less(iarythAbs(iaryth)))
			max = iarythAbs(iaryth);
	});

	return max;
}

function iarythAbs(iaryth)
{
	return iaryth.isNegative() ? iaryth.neg() : iaryth;
}

module.exports = {solveWithBigFinesMethod};
