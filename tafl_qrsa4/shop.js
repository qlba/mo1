const chalk = require('chalk');

const BUF_SIZ = 1024;

module.exports = class Shop
{
	constructor(...state)
	{
		this.stack = new Array(BUF_SIZ);
		this.ptr = -1;

		for(let i = 0; i < state.length; i++)
			this.stack[++this.ptr] = state[i];
	}

	push(element)
	{
		this.stack[++this.ptr] = element;

		if (this.ptr >= this.stack.length) {
			throw new Error('Stack overflow');
		}
	}

	peek()
	{
		return this.stack[this.ptr];
	}

	pop()
	{
		if (this.ptr === -1) {
			throw new Error('Stack underflow');
		}

		return this.stack[this.ptr--];
	}

	toString()
	{
		let top = this.stack[this.ptr].toString();
		let rem = this.stack.slice(0, this.ptr).reverse().join(' ');

		const s = Number(rem !== '');

		if (top.length + s + rem.length > 45)
			rem = rem.slice(0, 45 - top.length - s - 3) + '...';

		return (' ').repeat(45 - top.length - s - rem.length) + chalk.red(top) + (s ? ' ' : '') + rem;
	}
};
