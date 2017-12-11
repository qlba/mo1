const chalk = require('chalk');

module.exports = class Tape {
	constructor(input)
	{
		this.input = input;
		this.ptr = 0;
	}

	get()
	{
		return this.input[this.ptr];
	}

	shift()
	{
		this.ptr++;

		if (this.ptr >= this.input.length)
			throw new Error('Input exceeding');
	}

	toString()
	{
		let top = this.input[this.ptr].type;
		let rem = this.input.slice(this.ptr + 1).map(x => x.type).join(' ');
		
		const s = Number(rem !== '');

		if (top.length + s + rem.length > 45)
			rem = rem.slice(0, 45 - top.length - s - 3) + '...';

		return (' ').repeat(45 - top.length - s - rem.length) + chalk.red(top) + (s ? ' ' : '') + rem;
	}
};
