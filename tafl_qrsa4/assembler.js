const pEachSeries = require('p-each-series');
const _ = require('lodash');

const STACK_SIZE = 1024;


async function Assembler(asm)
{
	this.eax = undefined;
	this.ebx = undefined;
	this.ecx = undefined;
	this.edx = undefined;
	this.esi = undefined;
	this.edi = undefined;

	this.stack = new Array[STACK_SIZE];
	this.ebp = 0;
	this.esp = 0;

	this.eflags = {
		zf: undefined,
		sf: undefined
	};

	this.eip = 0;

	asm = _.compact(asm.split('\n'));

	await pEachSeries(asm, async (line) =>
	{
		const [mnemonics, ...args] = _.compact(line.split(/[ ,]/));

		this[mnemonics](args);





		await new Promise((resolve) => setTimeout(resolve, 1000));
	});
}

Assembler.prototype.ADD = function()
{
	const [lhs, rhs] = _.map(arguments, this.getParam.bind(this));

	if (lhs.loc !== 'reg')
		throw new Error('Invalid operand set');

	this.setFlags(lhs.set(lhs.get() + rhs.get()));
};

Assembler.prototype.SUB = function()
{
	const [lhs, rhs] = _.map(arguments, this.getParam.bind(this));

	if (lhs.loc !== 'reg' && rhs.loc !== 'reg')
		throw new Error('Invalid operand set');

	this.setFlags(lhs.set(lhs.get() - rhs.get()));
};

Assembler.prototype.MUL = function()
{
	const [lhs, rhs] = _.map(arguments, this.getParam.bind(this));

	if (lhs.loc !== 'reg')
		throw new Error('Invalid operand set');

	this.setFlags(lhs.set(lhs.get() * rhs.get()));
};

Assembler.prototype.DIV = function()
{
	const [lhs, rhs] = _.map(arguments, this.getParam.bind(this));

	if (lhs.loc !== 'reg')
		throw new Error('Invalid operand set');

	this.setFlags(lhs.set(lhs.get() / rhs.get()));
};

Assembler.prototype.MOV = function()
{
	const [lhs, rhs] = _.map(arguments, this.getParam.bind(this));

	if (lhs.loc === 'imm')
		throw new Error('Invalid operand set');

	lhs.set(rhs.get());
};

Assembler.prototype.PUSH = function()
{
	const [lhs] = _.map(arguments, this.getParam.bind(this));

	if (++this.esp > STACK_SIZE)
		throw new Error('Segmentation fault (stack overflow)');

	this.setMem('esp', -1, lhs.get());
};

Assembler.prototype.POP = function()
{
	const [lhs] = _.map(arguments, this.getParam.bind(this));

	if (lhs.loc === 'imm')
		throw new Error('Invalid operand set');

	if (this.esp === 0)
		throw new Error('Segmentation fault (stack underflow)');

	lhs.set(this.getMem('esp', -1));
	this.esp--;
};

Assembler.prototype.RET = function()
{
	if (this.esp < 1)
		throw new Error('Segmentation fault (stack underflow)');

	this.eip = this.esp--;
};


Assembler.prototype.getParam = function(addr)
{
	const reg = /^(eax|ebx|ecx|edx|esi|edi|ebp|esp)$/;
	const mem = /^\[(eax|ebx|ecx|edx|esi|edi|ebp|esp)?([+|-]?\d+)?\]$/;

	if(isFinite(addr))
		return {
			loc: 'imm',
			get: this.getImm.bind(this, Number.parseFloat(addr)),
			set: this.setImm.bind(this, Number.parseFloat(addr))
		};
	else if(reg.test(addr))
		return {
			loc: 'reg',
			get: this.getReg.bind(this, addr),
			set: this.setReg.bind(this, addr)
		};
	else if(mem.test(addr))
	{
		const [, reg, off] = mem.exec(addr);

		return {
			loc: 'mem',
			get: this.getMem.bind(this, reg, Number.parseInt(off)),
			set: this.setMem.bind(this, reg, Number.parseInt(off))
		};
	}
	else
		throw new Error('Invalid addressation type');
};

Assembler.prototype.setFlags = function(res)
{
	this.eflags.zf = res === 0;
	this.eflags.sf = res < 0;
};

Assembler.prototype.setReg = function(reg, value)
{
	if (!Number.isFinite(value))
		throw new Error(`${value} is not an assembler value`);

	return this[reg] = value;
};

Assembler.prototype.getReg = function(reg)
{
	return this[reg];
};

Assembler.prototype.setMem = function(reg, off, value)
{
	if (!Number.isFinite(value))
		throw new Error(`${value} is not an assembler value`);

	const addr = (reg && this[reg] || 0) + (off || 0);

	if (addr < 0)
		throw new Error('Segmentation fault (stack underflow)');

	if (addr >= STACK_SIZE)
		throw new Error('Segmentation fault (stack size overflow)');

	if (addr >= this.esp)
		throw new Error('Segmentation fault (stack pointer overflow)');

	return this.stack[addr] = value;
};

Assembler.prototype.getMem = function(reg, off)
{
	const addr = (reg && this[reg] || 0) + (off || 0);

	if (addr < 0)
		throw new Error('Segmentation fault (stack underflow)');

	if (addr >= STACK_SIZE)
		throw new Error('Segmentation fault (stack size overflow)');

	if (addr >= this.esp)
		throw new Error('Segmentation fault (stack pointer overflow)');

	return this.stack[this[reg] + off];
};

Assembler.prototype.setImm = function(value)
{
	if (!Number.isFinite(value))
		throw new Error(`${value} is not an assembler value`);

	throw new Error('Cannot set immediate value');
};

Assembler.prototype.getImm = function(imm)
{
	return imm;
};


module.exports = Assembler;
