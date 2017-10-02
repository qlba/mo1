var {MathMx} = require('./mx/math_mx'),
	{Double} = require('./double');

// var mx1 = [
// 		[1, 1, 1],
// 		[1, 1, 1],
// 		[1, 1, 1]
// 	], mx2 = [
// 		[1, 1, 1],
// 		[1, 1, 1],
// 		[1, 1, 1]
// 	];

// var {Frac} = require('./frac');

// var filler = mx => (_, i, j) => new Frac(mx[i][j], 1);

// var mmx1 = new MathMx(3, 3).fill(filler(mx1)),
// 	mmx2 = new MathMx(3, 3).fill(filler(mx2));

// console.log(mmx1.add(mmx2).toString());

// var mx1 = [
// 	[ 3,  4,  2],
// 	[ 2, -1, -3],
// 	[ 1,  5,  1]
// ];

// var mmx1 = new MathMx(3, 3).fill(filler(mx1));

// console.log(mmx1.toString());
// console.log(mmx1.transpose().toString());
// console.log(mmx1.invert().toString());
// console.log(mmx1.invert().mul(mmx1).toString());

var {delta} = require('./delta');
var draw = require('wrx');

var xs = [1, 2, 3, 4];
var F = x => Math.sin(x);
var ss = [0.3, 0.1, 0.4, 0.2];
var fs = [() => 1, x => x, x => x * x];

var ys = xs.map((x, i) => F(x) + delta(ss[i]));

var prox = approximate(xs, ys, ss, fs);

function proxFunc(x) {
	var sum = 0;

	for(var i = 0; i < fs.length; i++)
		sum += prox[0][i] * fs[i](x);

	return sum;
}


var analysis = new Array(100).fill(0).map((_, i) => 0.5 + 4 * (i / 100));

var graphConfig = {
	port: 8000,
	type: 'scatter',
	data: {datasets: [
		{ label: 'F(x)', data: analysis.map(x => {return {x: x, y: F(x)};}), lineTension: 0, showLine: true, fill: false, borderColor: 'rgba(0, 0, 0, 1)', borderWidth: 1, pointRadius: 0 },
		{ label: 'a(x)', data: analysis.map(x => {return {x: x, y: proxFunc(x)};}), lineTension: 0, showLine: true, fill: false, borderColor: 'rgba(255, 0, 0, 1)', borderWidth: 1, pointRadius: 0 },
		{ type: 'bubble', pointStyle: 'crossRot', label: 'points', data: xs.map((x, i) => {return {x: x, y: ys[i], r: 30 * ss[i]};}), borderColor: 'rgba(255, 0, 255, 1)' }
	]}
};

draw(graphConfig);


function approximate(xs, ys, ss, fs)
{
	var N = xs.length,
		k = fs.length;

	if(xs.length !== ys.length || ys.length !== ss.length)
		throw new Error('xs, ys and ss must be as long as N');

	var F = new MathMx(N, k);

	for(var i = 0; i < N; i++)
		for(var j = 0; j < k; j++)
			F.setElement(i, j, new Double(fs[j](xs[i])));

	var K = new MathMx(N, N);

	for(var i = 0; i < N; i++)
		for(var j = 0; j < N; j++)
			K.setElement(i, j, i === j ?
				new Double(Math.pow(ss[i], -2)) :
				Double.getZero()
			);

	var y = new MathMx(N, 1);

	for(var i = 0; i < N; i++)
		y.setElement(i, 0, new Double(ys[i]));

	var a = F.transpose().mul(K).mul(F).invert().mul(F.transpose()).mul(K).mul(y);

	return a.transpose().data;
}
