var {solveWithBruteForceMethod} = require('./method/brute_force'),
	{solveWithPureSimplexMethod} = require('./method/simplex/pure'),
	{solveWithArtificialBasicMethod} = require('./method/simplex/artificial_basic'),
	{solveWithBigFinesMethod} = require('./method/simplex/big_fines'),
	{CanonicalTask} = require('./method/canonical_task'),
	{Frac} = require('./frac');

var f = x => new Frac(x, 1);

var tasks = [
	new CanonicalTask(
		3, 2,
		[
			[f(1), f(0), f(5)],
			[f(0), f(1), f(9)]
		],
		[
			f(8),
			f(3)
		],
		[
			f(0), f(0), f(1)
		],
		f(8)
	),
	new CanonicalTask(
		5, 3,
		[
			[f(5), f(-3), f(1), f(-1), f( 4)],
			[f(1), f(-2), f(3), f( 4), f(-1)],
			[f(5), f(-6), f(3), f( 2), f( 4)]
		],
		[
			f(5),
			f(2),
			f(1)
		],
		[
			f(1), f(1), f(1), f(1), f(1)
		],
		f(0)
	),
	new CanonicalTask(
		6, 3,
		[
			[f( 2), f(1), f(-3), f(0), f(0), f( 6)],
			[f(-3), f(0), f( 2), f(1), f(0), f(-2)],
			[f( 1), f(0), f( 3), f(0), f(1), f(-4)]
		],
		[
			f(18),
			f(24),
			f(36)
		],
		[
			f(3), f(0), f(2), f(0), f(0), f(-6)
		],
		f(0)
	),
	new CanonicalTask(
		4, 2,
		[
			[f(2), f(1), f(1), f(0)],
			[f(1), f(3), f(0), f(1)]
		],
		[
			f(4),
			f(7)
		],
		[
			f(1), f(0), f(0), f(0)
		],
		f(0)
	),
	new CanonicalTask(
		6, 3,
		[
			[f( 2), f(-1), f( 0), f(-2), f(1), f(0)],
			[f( 3), f( 2), f( 1), f(-3), f(0), f(0)],
			[f(-1), f( 3), f( 0), f( 4), f(0), f(1)]
		],
		[
			f(16),
			f(18),
			f(24)
		],
		[
			f(2), f(3), f(0), f(-1), f(0), f(0)
		],
		f(0)
	),
	new CanonicalTask(
		6, 3,
		[
			[f(1), f(-2), f( 0), f(-3), f(0), f(-2)],
			[f(0), f( 4), f( 1), f(-4), f(0), f(-3)],
			[f(0), f( 5), f( 0), f( 5), f(1), f( 1)]
		],
		[
			f(12),
			f(12),
			f(25)
		],
		[
			f(0), f(8), f(0), f(7), f(0), f(1)
		],
		f(0)
	),
	new CanonicalTask(
		3, 2,
		[
			[f(2), f( 3), f(1)],
			[f(1), f(-5), f(4)]
		],
		[
			f(6),
			f(0)
		],
		[
			f(1), f(1), f(0)
		],
		f(0)
	),
	new CanonicalTask(
		5, 3,
		[
			[f(3), f(-5), f(1), f(2), f( 0)],
			[f(2), f(-2), f(0), f(1), f(-1)],
			[f(1), f(-3), f(0), f(2), f(-1)]
		],
		[
			f( 1),
			f(-4),
			f(-5)
		],
		[
			f(-1), f(-2), f(0), f(0), f(0)
		],
		f(0)
	),
	new CanonicalTask(
		6, 3,
		[
			[f( 2), f(1), f(0), f(0), f(-3), f( 5)],
			[f( 4), f(0), f(1), f(0), f( 2), f(-4)],
			[f(-3), f(0), f(0), f(1), f(-3), f( 6)]
		],
		[
			f(34),
			f(28),
			f(24)
		],
		[
			f(3), f(0), f(0), f(0), f(2), f(-5)
		],
		f(0)
	)
];


var st = solveWithPureSimplexMethod(tasks[8]);

console.log(`${st}`);


// tasks.forEach((task, index) =>
// {
// 	// try
// 	// {
// 		console.log('Task ' + (index + 1));

// 		console.time('BF');
// 		var st1 = solveWithBruteForceMethod(task);
// 		console.timeEnd('BF');

// 		console.log('BF: ' + st1.toString());
		
// 		console.time('AB');
// 		var st3 = solveWithArtificialBasicMethod(task);
// 		console.timeEnd('AB');

// 		console.log('AB: ' + st3.toString());
		
// 		console.time('BF');
// 		var st4 = solveWithBigFinesMethod(task);
// 		console.timeEnd('BF');

// 		console.log('BF: ' + st4.toString());
		
// 		// console.time('PS');
// 		// var st2 = solveWithPureSimplexMethod(task);
// 		// console.timeEnd('PS');
		
// 		// console.log('PS: ' + st2.toString());
		
// 		if(
// 			// st1.toString() !== st2.toString() ||
// 			st1.toString() !== st3.toString() ||
// 			st1.toString() !== st4.toString()
// 		)
// 		{
// 			console.log('RESULTS ARE DIFFERENT !!!');

// 			console.log('BF: ' + st1.toString('%.2f'));
// 			// console.log('PS: ' + st2.toString('%.2f'));
// 			console.log('AB: ' + st3.toString('%.2f'));
// 			console.log('BF: ' + st4.toString('%.2f'));
// 		}
// 	// }
// 	// catch(x)
// 	// {
// 	// 	console.log('Failure: ' + x.message);
// 	// }
// });
