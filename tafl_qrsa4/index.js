const chalk = require('chalk');

const fmt = '%4d %25s %25s  %s  %s  %s\n';
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

// const pp = (...args) => {console.dir(args); return ' ' + args.join('') + ' ';};

// const codegen = {
// 	1: pp,
// 	2: pp,
// 	3: pp
// };

const codegen = {
	1: ([E]) => {console.log(E);},
	2: ([,,E1,,E2]) => {return `${E1} + ${E2}`;},
	3: ([a]) => {return a;}
};

for(let round = 0, done = false; !done; round++)
{
	const M = shop.peek();
	const x = tape.get();

	const state = {};
	state.shop = shop.toString();
	state.tape = tape.toString();
	state.M = M;
	state.x = x;

	if (M === '$' && x === '$')
	{
		state.action = chalk.green('A');
		done = true;
	}
	else if (typeof(M) === 'number')
	{
		state.action = chalk.yellow(`P ${M}`);

		const rhs = rules[M].rhs, args = new Array(rhs.length);

		for (let i = rhs.length - 1; i >= 0; i--)
			args[i] = ppshop.pop();

		ppshop.push(codegen[M](args));

		shop.pop();
	}
	else if (select[M] && select[M][x])
	{
		state.action = chalk.cyan(`X ${rules[select[M][x]].lhs} -> ${rules[select[M][x]].rhs}`);

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

		ppshop.push(x);

		state.action = chalk.magenta(`M ${x}`);
	}
	else
	{
		state.action = chalk.red('R');
		done = true;
	}

	log(fmt, round, state.shop, state.tape, state.M, state.x, state.action);
}
