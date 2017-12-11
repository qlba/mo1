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
		const str = this.stack.slice(0, this.ptr + 1).reverse().join('');

		return str.length > 24 ? str.slice(0, 21) + '...' : str;
	}
};
