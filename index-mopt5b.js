const {gradualSimplex} = require('./method/gradual_simplex');
const {CanonicalTask} = require('./method/canonical_task');
const {Frac} = require('./frac');

var f = x => new Frac(x, 1);

var tasks = [
	new CanonicalTask(
		5, 3,
		[
			[f( 1), f( 1), f( 1), f( 0), f( 0)],
			[f(-1), f( 1), f( 0), f( 1), f( 0)],
			[f(-1), f(-2), f( 0), f( 0), f( 1)]
		],
		[
			f( 8),
			f(-4),
			f(-6)
		],
		[
			f(-1), f(-1), f( 0), f( 0), f( 0)
		],
		f(16)
	),
];

console.log(gradualSimplex(tasks[0], [3, 4, 5]).getDualSolution().toString());
