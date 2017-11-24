module.exports = class Tape {
	constructor(input) {
		this.input = input + '$';
		this.ptr = 0;
	}

	get() {
		return this.input[this.ptr];
	}

	shift() {
		this.ptr++;

		if (this.ptr >= this.input.length) {
			throw new Error('Input exceeding');
		}
	}

	toString() {
		return this.input.slice(this.ptr);
	}

	toStringRead() {
		return this.input.slice(0, this.ptr);
	}
};
