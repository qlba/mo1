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
		const str = this.input.slice(this.ptr).map(x => x.type).join('|');

		return str.length > 24 ? str.slice(0, 21) + '...' : str;
	}

	toStringRead()
	{
		return this.input.slice(0, this.ptr).map(x => x.type).join('|');
	}
};
