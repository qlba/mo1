const maxIter = 2000;
const minStep = 1e-323;
const factor = 2;

const argv = [...process.argv];

const [R, epsilon] = argv.splice(-2);
const [,, input, ...limInput] = argv;

// const R = 10, epsilon = 1e-6, input = 'x1^2+x2^2', limInput = ['2-x1-x2']; // 'x1^2+x2^2-2x1-2x2+2'



function parse(input) {
	// Lexical analysis
	const parsed = [];
	
	for(let i = 0; i < input.length; i++) {
		switch(input[i]) {
		case ' ':
			break;
		case '+':
		case '-':
			parsed.push(input[i]);
			break;
		default:
			parsed.length || parsed.push('');
			parsed[parsed.length - 1] += input[i];
			break;
		}
	}
	
	// Syntactic analysis
	const terms = [];
	let nmax = 0;
	
	parsed.forEach(term => {
		const [inK, ...inXs] = term.split(/x/i);
	
		let k;
	
		if((inK === '' || inK === '+') && inXs.length)
			k = 1;
		else if(inK === '-' && inXs.length)
			k = -1;
		else if(isFinite(inK))
			k = +inK;
		else
			throw new Error('Syntax error');
	
		const xs = [];
	
		inXs.forEach(inX => {
			const result = /^([1-9]\d*)(\^2)?$/.exec(inX);
	
			if(!result)
				throw new Error('Syntax error');

			if(+result[1] > nmax)
				nmax = +result[1];

			xs.push(result[1] - 1);
	
			if(result[2])
				xs.push(result[1] - 1);
		});

		terms.push({k, xs});
	});    

	return {terms, nmax};
}



const {terms: fTerms, nmax: n} = parse(input);

if(n > 20)
	throw new Error('Can\'t handle over 20 inputs');

const D = new Array(n).fill(0).map(() => new Array(n).fill(0));
const C = new Array(n).fill(0);
let c = 0;

fTerms.forEach(term => {
	const {k, xs} = term;

	switch(xs.length) {
	case 0:
		c += k;
		break;
	case 1:
		C[xs[0]] += k;
		break;
	case 2:
		D[xs[0]][xs[1]] += k / 2;
		D[xs[1]][xs[0]] += k / 2;
		break;
	default:
		throw new Error('Overpower');
	}
});

// console.dir(D);
// console.dir(C);
// console.dir(c);


var ll = limInput.length;

var limCs = new Array(ll);
var limcs = new Array(ll);

for(let l = 0; l < ll; l++) {
	// console.log(`Limitation ${l + 1}: ${limInput[l]}`);

	const {terms} = parse(limInput[l]);
	
	const C = new Array(n).fill(0);
	let c = 0;
	
	terms.forEach(term => {
		const {k, xs} = term;
	
		switch(xs.length) {
		case 0:
			c += R * k;
			break;
		case 1:
			C[xs[0]] += R * k;
			break;
		default:
			throw new Error('Overpower');
		}
	});

	limCs[l] = C;
	limcs[l] = c;

	// console.dir(C);
	// console.dir(c);
}

const f = xs => {
	let result = 0, i, j, l;

	if(xs.length !== n)
		throw new Error('Invalid input vector');

	for(i = 0; i < n; i++)
		for(j = 0; j < n; j++)
			result += D[i][j] * xs[i] * xs[j];

	for(i = 0; i < n; i++)
		result += C[i] * xs[i];

	result += c;

	for(l = 0; l < ll; l++) {
		let limResult = 0;

		for(i = 0; i < n; i++)
			limResult += limCs[l][i] * xs[i];

		limResult += limcs[l];

		result += limResult > 0 ? limResult : 0;
	}

	console.log(`f(${xs.join(', ')}) = ${result}`);

	return result;
};

const df = (i, xs) => {
	let result = 0, j, l;

	if(i < 0 || i >= n)
		throw new Error('Invalid n');

	if(xs.length !== n)
		throw new Error('Invalid input vector');

	for(j = 0; j < n; j++)
		result += 2 * D[i][j] * xs[j];

	result += C[i];

	for(l = 0; l < ll; l++) {
		var sum = 0;

		for(j = 0; j < n; j++)
			sum += limCs[l][j] * xs[j];

		sum += limcs[l];

		console.log(`Limitation [${l}] ${limInput[l]} <= 0: ${sum / R} ${sum > 0 ? '>' : '<='} 0`);

		result += sum > 0 ? limCs[l][i] : 0;
	}

	return result;
};

// Empirical gradient descednt
{
	let xk = new Array(n).fill(0);

	let h = 1;
	let round = 0;

	for(let iter = 0; iter < maxIter && h > minStep; iter++) {
		console.log(`Round ${round} (${iter})`);

		const grad = new Array(n).fill(0).map((_, i) => df(i, xk));

		let modGrad = 0;

		for(let i = 0; i < n; i++)
			modGrad += grad[i] * grad[i];

		modGrad = Math.sqrt(modGrad);

		console.log(`(${xk.join(', ')}), h = ${h}, |grad| = ${modGrad}`);

		grad.forEach((dx, i) =>
			console.log(`df / dx${i + 1} = ${dx}`)
		);

		if(modGrad < epsilon * epsilon)
			break;

		const xkp1 = xk.map((x, i) => x - grad[i] / modGrad * h);

		if(f(xk) <= f(xkp1)) {
			h = h / factor;
			continue;
		}

		xk = xkp1;
		round++;
	}
}

// const steepestH = xk => {
// 	let p = 0, q = 0, i, j;

// 	const grad = new Array(n).fill(0).map((_, i) => df(i, xk));

// 	for(i = 0; i < n; i++)
// 		for(j = 0; j < n; j++)
// 			p += D[i][j] * (grad[i] * xk[j] + grad[j] * xk[i]);

// 	for(i = 0; i < n; i++)
// 		p += C[i] * grad[i];

// 	for(i = 0; i < n; i++)
// 		for(j = 0; j < n; j++)
// 			q += 2 * D[i][j] * grad[i] * grad[j];

// 	return p / q;
// };

// // // Steepest gradient descent
// // {
// // 	let xk = new Array(n).fill(0);

// // 	let round = 0;

// // 	for(;;) {
// // 		const grad = new Array(n).fill(0).map((_, i) => df(i, xk));

// // 		const h = steepestH(xk);

// // 		console.log(`Round ${round}: (${xk.join(', ')}), h = ${h}`);

// // 		if(h < epsilon * epsilon)
// // 			break;

// // 		const xkp1 = xk.map((x, i) => x - grad[i] * h);

// // 		xk = xkp1;
// // 		round++;
// // 	}
// }

// Newton-Raffson method
// {
// 	const {MathMx} = require('./mx/math_mx');
// 	const {Double} = require('./double');

// 	const H = new MathMx(n, n);
// 	let i, j;

// 	for(i = 0; i < n; i++)
// 		for(j = 0; j < n; j++)
// 			H.setElement(i, j, new Double(2 * D[i][j]));

// 	let round = 0;

// 	let xk = new Array(n).fill(0);

// 	for(;;) {
// 		const grad = new Array(n).fill(0).map((_, i) => df(i, xk));

// 		let modGrad = 0;

// 		for(let i = 0; i < n; i++)
// 			modGrad += grad[i] * grad[i];

// 		console.log(`Round ${round}: (${xk.join(', ')}), |grad| = ${modGrad}`);

// 		if(modGrad < epsilon * epsilon)
// 			break;

// 		const gradVector = new MathMx(n, 1);

// 		for(i = 0; i < n; i++)
// 			gradVector.setElement(i, 0, new Double(grad[i]));

// 		const product = H.invert().mul(gradVector);

// 		for(i = 0; i < n; i++)
// 			xk[i] -= product.getElement(i, 0);

// 		round++;
// 	}
// }
