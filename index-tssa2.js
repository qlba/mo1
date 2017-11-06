var {MathMx} = require('./mx/math_mx'),
	{Double} = require('./double'),
	{delta} = require('./delta'),
	draw = require('wrx');

function tabulate(n, a, b) {
	return new Array(n).fill(0).map((_, i) => a + (b - a) * i / (n - 1));
}

const n = 5;
const a = Math.PI / 12;
const b = Math.PI / 2;

const f = x => Math.cos(x);
const xs = tabulate(n, a, b);
const sigmaWs = tabulate(n, 0.3, 0.3);
const sigmaVs = tabulate(n, 1e-6, 1e-6);
const fs = [x => Math.sin(x), x => Math.cos(x)];
const dfs = [x => Math.cos(x), x => -Math.sin(x)];

const args = xs.map((x, i) => x + delta(sigmaWs[i]));
const ys = args.map((x, i) => f(x) + delta(sigmaVs[i]));

const u = confluent(fs, dfs, xs, ys, sigmaWs, sigmaVs);

console.log(u.toString('%.2f'));

// function approxFunc()

function proxFunc(x) {
	var sum = 0;

	for(var i = 0; i < fs.length; i++)
		sum += u[i] * fs[i](x);

	return sum;
}


var analysis = tabulate(251, a, b); // new Array(250).fill(0).map((_, i) => 6.28 * i / 249);

var graphConfig = {
	port: 3000,
	type: 'scatter',
	data: {datasets: [
		{ label: 'F(x)', data: analysis.map(x => ({x: x, y: f(x)})), lineTension: 0, showLine: true, fill: false, borderColor: 'rgba(0, 0, 0, 1)', borderWidth: 1, pointRadius: 0 },
		{ label: 'a(x)', data: analysis.map(x => ({x: x, y: proxFunc(x)})), lineTension: 0, showLine: true, fill: false, borderColor: 'rgba(255, 0, 0, 1)', borderWidth: 1, pointRadius: 0 },
		{ type: 'bubble', pointStyle: 'circle', label: 'F(x)',   data: xs.map((x, i) => ({x: xs[i], y: f(xs[i]), r: 4})), backgroundColor: '#0000ff', borderColor: 'rgba(0, 0, 0, 0)' },
		{ type: 'bubble', pointStyle: 'circle', label: 'F(w)',   data: xs.map((x, i) => ({x: args[i], y: f(args[i]), r: 4})), backgroundColor: '#5f00af', borderColor: 'rgba(0, 0, 0, 0)' },
		{ type: 'bubble', pointStyle: 'circle', label: 'F(w)+v', data: xs.map((x, i) => ({x: args[i], y: ys[i], r: 4})), backgroundColor: '#af005f', borderColor: 'rgba(0, 0, 0, 0)' },
		{ type: 'bubble', pointStyle: 'circle', label: 'input',  data: xs.map((x, i) => ({x: xs[i], y: ys[i], r: 4})), backgroundColor: '#ff0000', borderColor: 'rgba(0, 0, 0, 0)' },



		//{ type: 'bubble', pointStyle: 'triangle', label: 'F(x) + 3\u03c3', data: xs.map((x, i) => {return {x: x, y: F(x) + 3 * ss[i], r: 5};}), borderColor: 'rgba(63, 255, 63, 1)' },
		//{ type: 'bubble', pointStyle: 'triangle', label: 'F(x) - 3\u03c3', data: xs.map((x, i) => {return {x: x, y: F(x) - 3 * ss[i], r: 5};}), borderColor: 'rgba(63, 255, 63, 1)' },
		//{ type: 'bubble', pointStyle: 'triangle', label: 'x + 3\u03c3', data: xs.map((x, i) => {return {x: x + 3 * ps[i], y: F(x), r: 5};}), borderColor: 'rgba(63, 255, 255, 1)' },
		//{ type: 'bubble', pointStyle: 'triangle', label: 'x - 3\u03c3', data: xs.map((x, i) => {return {x: x - 3 * ps[i], y: F(x), r: 5};}), borderColor: 'rgba(63, 255, 255, 1)' }
	]},
	options: {
		// scales: {
		// 	xAxes: [{
		// 		ticks: {
		// 			min: a,
		// 			max: b
		// 		}
		// 	}]
		// }
	}
};

draw(graphConfig);




function confluent(fs, dfs, xs, ys, sigmaWs, sigmaVs) {
	var N = xs.length,
		k = fs.length,
		i, j;

	if(dfs.length !== k)
		throw new Error('fs, dfs must be equally long');

	if(ys.length !== N || sigmaWs.length !== N || sigmaVs.length !== N)
		throw new Error('xs, ys, sigmaWs, sigmaVs must be equally long');

	var F = new MathMx(N, k).fill((_, i, j) => new Double(fs[j](xs[i])));
	var DF = new MathMx(N, k).fill((_, i, j) => new Double(dfs[j](xs[i])));
	var y = new MathMx(N, 1).fill((_, i) => new Double(ys[i]));
	var Kw = new MathMx(N, N).fill((_, i, j) => i === j ? new Double(sigmaWs[i] * sigmaWs[i]) : Double.getZero());
	var Kv = new MathMx(N, N).fill((_, i, j) => i === j ? new Double(sigmaVs[i] * sigmaVs[i]) : Double.getZero());

	var a = new MathMx(k, 1).fill(() => Double.getZero());

	for(;;) {
		console.log(a.transpose().toString('%.3f'));

		var P = new MathMx(N, N).fill(() => Double.getZero());

		for(i = 0; i < N; i++) {
			var sum = Double.getZero();

			for(j = 0; j < k; j++)
				sum = sum.add(DF.getElement(i, j).mul(a.getElement(j, 0)));

			P.setElement(i, i, sum);
		}

		var K = P.mul(Kw).mul(P.transpose()).add(Kv).invert();

		var aNew = F.transpose().mul(K).mul(F).invert().mul(F.transpose()).mul(K).mul(y);

		var difA = Double.getZero();

		for(j = 0; j < k; j++)
			difA = difA.add(
				aNew.getElement(j, 0).sub(a.getElement(j, 0)).mul(aNew.getElement(j, 0).sub(a.getElement(j, 0)))
			);

		console.log(difA.toString('%.12f'));

		a = aNew;

		if(difA.less(new Double(1e-6).mul(new Double(1e-6))))
			break;
	}

	return a.transpose().data[0].map(a => a.a);
}
