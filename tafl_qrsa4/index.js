const fmt = '%4d %25s %25s %25s  %s  %s  %s\n';
const {log} = require('./utils');

const Shop = require('./shop');
const Tape = require('./tape');

const shop = new Shop('$', 'S');
const tape = new Tape('+(+(a,a),+(a,a))$');

const ppshop = new Shop();

const rules = {
	1: {lhs: 'S', rhs: 'E'},
	2: {lhs: 'E', rhs: '+(E,E)'},
	3: {lhs: 'E', rhs: 'a'}
};

const select = {
	'S': {
		'+': 1,
		'a': 1
	},
	'E': {
		'+': 2,
		'a': 3
	}
};

const codegen = {
	1: ([E]) => {console.log(E);},
	2: ([,,E1,,E2]) => {console.log(`${E1} + ${E2}`);},
	3: ([a]) => {console.log(a);}
};


for(let round = 0, done = false; !done; round++)
{
	const M = shop.peek();
	const x = tape.get();

	const state = {};
	state.shop = shop.toString();
	state.tape = tape.toString();
	state.intermediate = tape.toStringRead() + shop.toString();
	state.M = M;
	state.x = x;

	if (M === '$' && x === '$')
	{
		state.action = 'A';
		done = true;
	}
	else if (typeof(M) === 'number')
	{
		state.action = `P ${M}`;

		/// ...

		shop.pop();
	}
	else if (select[M] && select[M][x])
	{
		state.action = `X ${rules[select[M][x]].lhs} -> ${rules[select[M][x]].rhs}`;

		const rhs = rules[select[M][x]].rhs;

		shop.pop();
		shop.push(select[M][x]);

		for (let i = rhs.length - 1; i >= 0; i--)
			shop.push(rhs[i]);
	}
	else if (M === x)
	{
		tape.shift();
		shop.pop();

		state.action = `M ${x}`;
	}
	else
	{
		state.action = 'R';
		done = true;
	}

	log(fmt, round, state.shop, state.tape, state.intermediate, state.M, state.x, state.action);
}
