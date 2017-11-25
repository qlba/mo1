const chalk = require('chalk');
const {log} = require('./utils');
const Shop = require('./shop');
const Tape = require('./tape');

module.exports = class Syntan
{
	constructor(rules, init, select, postproc)
	{
		Object.assign(this, {
			rules, init, select, postproc
		});
	}

	parse(input)
	{
		const {rules, init, select, postproc} = this;
	
		const shop = new Shop('$', init);
		const tape = new Tape(input + '$');
		
		const ppshop = new Shop();
	
		let done = false, accept = false;
	
		for(let round = 0; !done; round++)
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
				done = accept = true;
			}
			else if (typeof(M) === 'number')
			{
				state.action = chalk.yellow(`P ${M}`);
		
				const rhs = rules[M].rhs, args = new Array(rhs.length);
		
				for (let i = rhs.length - 1; i >= 0; i--)
					args[i] = ppshop.pop();
		
				ppshop.push(postproc[M](args));
		
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
		
			log('%4d %25s %25s  %s  %s  %s\n', round, state.shop, state.tape, state.M, state.x, state.action);
		}
		
		return {
			accept,
			result: ppshop.pop()
		};
	}
};
