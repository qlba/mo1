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

	parse(state, input)
	{
		const {rules, init, select, postproc} = this;
	
		const shop = new Shop('$', init);
		const tape = new Tape(input);
		
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
		
			if (M === '$' && x.type === '$')
			{
				state.action = chalk.green('A');
				done = accept = true;
			}
			else if (typeof(M) === 'number')
			{
				state.action = chalk.cyan(`P  ${M}`);
		
				const rhs = rules[M].rhs, args = new Array(rhs.length);
		
				for (let i = rhs.length - 1; i >= 0; i--)
					args[i] = ppshop.pop();
		
				ppshop.push(postproc[M](state, args));
		
				shop.pop();
			}
			else if (select[M] && select[M][x.type])
			{
				state.action = chalk.yellow(`X  ${rules[select[M][x.type]].lhs} -> ${rules[select[M][x.type]].rhs}`);
		
				const rhs = rules[select[M][x.type]].rhs;
		
				shop.pop();
				shop.push(select[M][x.type]);
		
				for (let i = rhs.length - 1; i >= 0; i--)
					shop.push(rhs[i]);
			}
			else if (M === x.type)
			{
				tape.shift();
				shop.pop();
		
				ppshop.push(x);
		
				state.action = chalk.magenta(`M  ${x.type}`);
			}
			else
			{
				state.action = chalk.red('R');
				done = true;
			}
		
			log('%4d %25s %25s  %s  %s  %s\n', round, state.shop, state.tape.map(x => x.type).join(''), state.M, state.x.type, state.action);
		}
		
		return {
			accept,
			result: ppshop.pop()
		};
	}
};
