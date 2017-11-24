const Shop = require('./shop');
const Tape = require('./tape');
const {log} = require('./utils');

const fmt = '%4d %25s %25s %25s  %s  %s  %s\n';

const shop = new Shop('E');
const tape = new Tape('+(+(a,a),+(a,a))');

const rules = {
	1: {lhs: 'E', rhs: '+(E,E)'},
	2: {lhs: 'E', rhs: 'a'}
};

const select = {
	'E': {
		'+': 1,
		'a': 2
	}
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
	else if (select[M] && select[M][x])
	{
		state.action = `X ${rules[select[M][x]].lhs} -> ${rules[select[M][x]].rhs}`;

		const rhs = rules[select[M][x]].rhs;
		
		tape.shift();
		shop.pop();

		for (let i = rhs.length - 1; i > 0; i--)
			shop.push(rhs[i]);
	}
	else if (M === x)
	{
		tape.shift();
		shop.pop();

		state.action = `C ${x}`;
	}
	else
	{
		state.action = 'R';
		done = true;
	}

	log(fmt, round, state.shop, state.tape, state.intermediate, state.M, state.x, state.action);
}
