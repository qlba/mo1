const [,, input, epsilon] = process.argv;

let parsed = [];

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

	console.log(`Term: ${k}${xs.map(x => ` * x${x + 1}`).join('')}`);
});

if(nmax > 20)
	throw new Error('Can\'t handle over 20 inputs');

const D = new Array(nmax).fill(0).map(() => new Array(nmax).fill(0));
const C = new Array(nmax).fill(0);
let c = 0;

terms.forEach(term => {
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

console.dir(D);
console.dir(C);
console.dir(c);

const f = xs => {
	let result = 0, i, j;

	if(xs.length !== nmax)
		throw new Error('Invalid input vector');

	for(i = 0; i < nmax; i++)
		for(j = 0; j < nmax; j++)
			result += D[i][j] * xs[i] * xs[j];

	for(i = 0; i < nmax; i++)
		result += C[i] * xs[i];

	result += c;

	return result;
};

const df = (i, xs) => {
	let result = 0, j;

	if(i < 0 || i >= nmax)
		throw new Error('Invalid nmax');

	if(xs.length !== nmax)
		throw new Error('Invalid input vector');

	for(j = 0; j < nmax; j++)
		result += 2 * D[i][j] * xs[j];

	result += C[i];

	return result;
};

// Empirical gradient descednt
{
	let xk = new Array(nmax).fill(0);

	let h = 1;
	let round = 0;

	for(;;) {
		const grad = new Array(nmax).fill(0).map((_, i) => df(i, xk));
		let modGrad = 0;

		for(let i = 0; i < nmax; i++)
			modGrad += grad[i] * grad[i];

		console.log(`Round ${round}: (${xk.join(', ')}), h = ${h}, |grad| = ${modGrad}`);

		if(modGrad < epsilon * epsilon)
			break;

		const xkp1 = xk.map((x, i) => x - grad[i] * h);

		if(f(xk) <= f(xkp1)) {
			h /= 2;
			continue;
		}

		xk = xkp1;
		round++;
	}
}

const steepestH = xk => {
	let p = 0, q = 0, i, j;

	const grad = new Array(nmax).fill(0).map((_, i) => df(i, xk));

	for(i = 0; i < nmax; i++)
		for(j = 0; j < nmax; j++)
			p += D[i][j] * (grad[i] * xk[j] + grad[j] * xk[i]);

	for(i = 0; i < nmax; i++)
		p += C[i] * grad[i];

	for(i = 0; i < nmax; i++)
		for(j = 0; j < nmax; j++)
			q += 2 * D[i][j] * grad[i] * grad[j];

	return p / q;
};

// Steepest gradient descent
{
	let xk = new Array(nmax).fill(0);

	let round = 0;

	for(;;) {
		const grad = new Array(nmax).fill(0).map((_, i) => df(i, xk));

		const h = steepestH(xk);

		console.log(`Round ${round}: (${xk.join(', ')}), h = ${h}`);

		if(h < epsilon * epsilon)
			break;

		const xkp1 = xk.map((x, i) => x - grad[i] * h);

		xk = xkp1;
		round++;
	}
}

// Newton-Raffson method
{
	const {MathMx} = require('./mx/math_mx');
	const {Double} = require('./double');

	const H = new MathMx(nmax, nmax);
	let i, j;

	for(i = 0; i < nmax; i++)
		for(j = 0; j < nmax; j++)
			H.setElement(i, j, new Double(2 * D[i][j]));

	let round = 0;

	let xk = new Array(nmax).fill(0);

	for(;;) {
		const grad = new Array(nmax).fill(0).map((_, i) => df(i, xk));

		let modGrad = 0;

		for(let i = 0; i < nmax; i++)
			modGrad += grad[i] * grad[i];

		console.log(`Round ${round}: (${xk.join(', ')}), |grad| = ${modGrad}`);

		if(modGrad < epsilon * epsilon)
			break;

		const gradVector = new MathMx(nmax, 1);

		for(i = 0; i < nmax; i++)
			gradVector.setElement(i, 0, new Double(grad[i]));

		const product = H.invert().mul(gradVector);

		for(i = 0; i < nmax; i++)
			xk[i] -= product.getElement(i, 0);

		round++;
	}
}
