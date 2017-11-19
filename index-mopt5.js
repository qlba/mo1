const {dualSimplex} = require('./method/dual_simplex');
const {solveWithArtificialBasicMethod} = require('./method/simplex/artificial_basic');
const {CanonicalTask} = require('./method/canonical_task');
const {Frac} = require('./frac');

var f = x => new Frac(x, 1);

var tasks = [
	new CanonicalTask(
		4, 2,
		[
			[f(2), f(1), f( 1), f( 0)],
			[f(1), f(2), f( 0), f( 1)]
		],
		[
			f(8),
			f(10)
		],
		[
			f(1), f(1), f(0), f(0)
		],
		f(0)
	),
	new CanonicalTask(
		4, 2,
		[
			[f(-2), f(-1), f( 1), f( 0)],
			[f(-1), f(-2), f( 0), f( 1)]
		],
		[
			f(-1),
			f(-1)
		],
		[
			f(-8), f(-10), f(0), f(0)
		],
		f(0)
	),
	new CanonicalTask(
		2, 3,
		[
			[f( 1), f(-2)],
			[f(-2), f( 1)],
			[f( 3), f( 1)]
		],
		[
			f(1),
			f(2),
			f(3)
		],
		[
			f(-1), f(1)
		],
		f(0)
	),
	new CanonicalTask(
		5, 2,
		[
			[f( 1), f(-2), f(3), f(-1), f( 0)],
			[f(-2), f( 1), f(1), f( 0), f(-1)]
		],
		[
			f(-1),
			f( 1)
		],
		[
			f(-1), f(-2), f(-3), f(0), f(0)
		],
		f(0)
	),


	new CanonicalTask(
		5, 2,
		[
			[f( 1), f(-2), f(3), f(-1), f( 0)],
			[f(-2), f( 1), f(1), f( 0), f(-1)]
		],
		[
			f(-1),
			f( 1)
		],
		[
			f(-1), f(-2), f(-3), f(0), f(0)
		],
		f(0)
	),
];


dualSimplex(tasks[0]);
console.log('----------------------------------------------');
solveWithArtificialBasicMethod(tasks[1]);

// console.log(`${st}`);


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
