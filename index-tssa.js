var {MathMx} = require('./mx/math_mx'),
	{Double} = require('./double');

var pow = y => x => Math.pow(x, y);

var {delta} = require('./delta');
var draw = require('wrx');

var tab = (a, b, n) => new Array(n).fill(0).map((_, i) => a + (b - a) * i / (n - 1));

var xs = tab(0, 1, 11); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => 6.28 * i / 9);

var F = x => x;
var ss = xs.map((x, i) => 0.1 * (i + 1) /* * (x + 1) */);
var ps = xs.map((x, i) => 0 /* * Math.sqrt(i) */);
var fs = [pow(0), pow(1), pow(3), pow(5), pow(7)];

var ws = xs.map((x, i) => x + delta(ps[i]));
var ys = ws.map((w, i) => F(w) + delta(ss[i]));

var prox = approximate(xs, ys, ss, fs);

console.log(prox[0].map((a, i) => a.toString('%.4f') + '*f' + (i)).join(' + '));

function proxFunc(x) {
	var sum = 0;

	for(var i = 0; i < fs.length; i++)
		sum += prox[0][i] * fs[i](x);

	return sum;
}


var analysis = tab(0, 1, 251) // new Array(250).fill(0).map((_, i) => 6.28 * i / 249);

var graphConfig = {
	port: 3000,
	type: 'scatter',
	data: {datasets: [
		{ label: 'F(x)', data: analysis.map(x => {return {x: x, y: F(x)};}), lineTension: 0, showLine: true, fill: false, borderColor: 'rgba(0, 0, 0, 1)', borderWidth: 1, pointRadius: 0 },
		{ label: 'a(x)', data: analysis.map(x => {return {x: x, y: proxFunc(x)};}), lineTension: 0, showLine: true, fill: false, borderColor: 'rgba(255, 0, 0, 1)', borderWidth: 1, pointRadius: 0 },
		{ type: 'bubble', pointStyle: 'circle', label: 'F(x)',   data: xs.map((x, i) => {return {x: xs[i], y: F(xs[i]), r: 4};}), backgroundColor: '#0000ff', borderColor: 'rgba(0, 0, 0, 0)' },
		{ type: 'bubble', pointStyle: 'circle', label: 'F(w)',   data: xs.map((x, i) => {return {x: ws[i], y: F(ws[i]), r: 4};}), backgroundColor: '#5f00af', borderColor: 'rgba(0, 0, 0, 0)' },
		{ type: 'bubble', pointStyle: 'circle', label: 'F(w)+v', data: xs.map((x, i) => {return {x: ws[i], y: ys[i], r: 4};}),    backgroundColor: '#af005f', borderColor: 'rgba(0, 0, 0, 0)' },
		{ type: 'bubble', pointStyle: 'circle', label: 'input',  data: xs.map((x, i) => {return {x: xs[i], y: ys[i], r: 4};}),    backgroundColor: '#ff0000', borderColor: 'rgba(0, 0, 0, 0)' },



		//{ type: 'bubble', pointStyle: 'triangle', label: 'F(x) + 3\u03c3', data: xs.map((x, i) => {return {x: x, y: F(x) + 3 * ss[i], r: 5};}), borderColor: 'rgba(63, 255, 63, 1)' },
		//{ type: 'bubble', pointStyle: 'triangle', label: 'F(x) - 3\u03c3', data: xs.map((x, i) => {return {x: x, y: F(x) - 3 * ss[i], r: 5};}), borderColor: 'rgba(63, 255, 63, 1)' },
		//{ type: 'bubble', pointStyle: 'triangle', label: 'x + 3\u03c3', data: xs.map((x, i) => {return {x: x + 3 * ps[i], y: F(x), r: 5};}), borderColor: 'rgba(63, 255, 255, 1)' },
		//{ type: 'bubble', pointStyle: 'triangle', label: 'x - 3\u03c3', data: xs.map((x, i) => {return {x: x - 3 * ps[i], y: F(x), r: 5};}), borderColor: 'rgba(63, 255, 255, 1)' }
	]},
	options: {
    //scales: {
      //xAxes: [{
        //ticks: {
          //min: 0,
          //max: 9
        //}
      //}]
    //}
  }
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
