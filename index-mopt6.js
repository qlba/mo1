const {dualSimplex} = require('./method/dual_simplex');
const {CanonicalTask} = require('./method/canonical_task');
const {Frac} = require('./frac');

var f = (x, y = 1) => new Frac(x, y);

// var game = [
// 	[f( 2), f(-3), f( 4)],
// 	[f(-3), f( 4), f(-5)],
// 	[f( 4), f(-5), f( 6)]
// ];

// var game = [
// 	[f(7), f(6), f(7), f(5)],
// 	[f(6), f(7), f(9), f(8)],
// 	[f(5), f(8), f(4), f(6)]
// ];

// var game = [
// 	[f(8), f(4), f(7)],
// 	[f(6), f(5), f(9)],
// 	[f(7), f(7), f(8)]
// ];

// var game = [
// 	[f(2), f(1), f(5),    f(3)],
// 	[f(1), f(3), f(4), f(1, 2)]
// ];

// var game = [
// 	[f( 7), f( 3), f( 4)],
// 	[f( 5), f( 4), f( 9)],
// 	[f( 9), f(12), f( 5)],
// 	[f(10), f( 7), f( 6)]
// ];

var game = [
	[f(  7), f(-10)],
	[f( -5), f(  2)]
];


var m = game.length, n = game[0].length;

for(var i = 0; i < m; i++)
	if(game[i].length !== n)
		throw new Error('Game is not a valid matrix');

var C = null;

for(var i = 0; i < m; i++)
	for(var j = 0; j < n; j++)
		if(!C || game[i][j].less(C))
			C = game[i][j];

C = C.sub(C.getOne());
// C = C.getZero();

// var transposed = new Array(n);

// for(var j = 0; j < n; j++)
// 	transposed[j] = new Array(m);

for(var i = 0; i < m; i++)
	for(var j = 0; j < n; j++)
		game[i][j] = game[i][j].sub(C);

var task = new CanonicalTask(
	n, m,
	game,
	new Array(m).fill(C.getOne()),
	new Array(n).fill(C.getOne()),
	C.getZero()
);

var splx = dualSimplex(task);

var A = splx.getSolution().value;


var ps = splx.getDualSolution();
var qs = splx.getSolution();

ps.point = ps.point.map(p => p.div(A)).slice(0, m);
qs.point = qs.point.map(q => q.div(A)).slice(0, n);
ps.value = ps.value.inv().add(C);
qs.value = qs.value.inv().add(C);

console.log('---------------------------------------------------------------------------');
console.log(ps.toString());
console.log(qs.toString());
