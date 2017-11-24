const Shop = require('./shop');
const Tape = require('./tape');
const {log} = require('./utils');

const fmt = '%25s %25s %25s %2s %2s %s\n';

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


for(let done = false; !done;)
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
		state.action = 'ACCEPT';
		done = true;
	}
	else if (select[M])
	{
		if (!select[M][x])
		{
			state.action = 'REJECT';
			done = true;
		}

		state.action = `EXPAND ${rules[select[M][x]].lhs} -> ${rules[select[M][x]].rhs}`;

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

		state.action = `COMMIT ${x}`;
	}
	else
	{
		state.action = 'REJECT';
		done = true;
	}

	log(fmt, state.shop, state.tape, state.intermediate, state.M, state.x, state.action);
}
