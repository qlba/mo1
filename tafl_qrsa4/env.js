const chalk = require('chalk');
const _ = require('lodash');

const STACK_SIZE = 1024;


const m = {
	eax: undefined,
	ebx: undefined,
	ecx: undefined,
	edx: undefined,
	esi: undefined,
	edi: undefined,
	esp: STACK_SIZE - 1,
	ebp: STACK_SIZE - 1,
	eip: 0,
	eflags: {
		zf: false,
		sf: false,
		xf: false,
		jf: false
	},
	stack: new Array(STACK_SIZE)
};

let mPrev = _.cloneDeep(m);
let eipPrev = 0;


module.exports = async function run(asm, debug) {
	m.code = _.compact(asm.split('\n')).map(line =>
		(a => ({mnemonics: a[0], args: a.slice(1)}))(_.compact(line.split(/[ ,\t]/)))
	);

	for (let round = 0; !m.eflags.xf; round++)
	{
		try
		{
			const {mnemonics, args} = m.code[eipPrev = I(m.eip)];

			if (!commands[mnemonics])
				throw new Error(`No such command: ${mnemonics}`);

			await commands[mnemonics].func(
				...checkLocs(commands[mnemonics].locs)(args.map(getParam))
			);

			debug && process.stdout.write(`\n ------ ------ ${round.toString().padStart(5)}\n`);

			debug && printState(mPrev, eipPrev);
			debug && (mPrev = _.cloneDeep(m));
			
			if (!m.eflags.jf)
				m.eip++;
			else
				m.eflags.jf = false;
			
			debug && process.stdout.write('Press <RETURN> to continue ...\n');
		}
		catch(e)
		{
			console.error(e);
			setImmediate(() => {throw e;});
			throw e;
		}
		
		debug && await new Promise((resolve) => process.stdin.once('data', resolve));
	}

	debug && console.log(`Program finished with exit code ${chalk[m.eax === 0 ? 'green' : 'red'](m.eax)}`);

	return m.eax;
};

const commands = {
	NOP: {
		locs: [[]],
		func: () => 0
	},
	INT: {
		locs: [[/imm/]],
		func: async (id) => await interruption(id.get())
	},
	MOV: {
		locs: [
			[/reg/, /$/], [/mem/, /(reg|imm)/]
		],
		func: (dst, src) => dst.set(src.get())
	},
	PUSH: {
		locs: [[/(reg|imm)/]],
		func: (src) => {
			prop.reg('esp').set(prop.reg('esp').get() - 1);
			prop.mem('esp', +1).set(src.get());
		}
	},
	POP: {
		locs: [[/(reg|imm)/]],
		func: (dst) => {
			dst.set(prop.mem('esp', +1).get());
			prop.reg('esp').set(prop.reg('esp').get() + 1);
		}
	},
	CALL: {
		locs: [[/imm/]],
		func: (addr) => {
			prop.reg('esp').set(prop.reg('esp').get() - 1);
			prop.mem('esp', +1).set(prop.reg('eip').get() + 1);
			prop.reg('eip').set(addr.get());

			m.eflags.jf = true;
		}
	},
	RET: {
		locs: [[]],
		func: () => {
			prop.reg('eip').set(prop.mem('esp', +1).get());
			prop.reg('esp').set(prop.reg('esp').get() + 1);
			
			m.eflags.jf = true;
		}
	},
	ADD: {
		locs: [[/reg/, /$/]],
		func: (dst, src) => setFlags(dst.set(dst.get() + src.get()))
	},
	SUB: {
		locs: [[/reg/, /$/], [/mem/, /(reg|imm)/]],
		func: (dst, src) => setFlags(dst.set(dst.get() - src.get()))
	},
	MUL: {
		locs: [[/reg/, /$/]],
		func: (dst, src) => setFlags(dst.set(dst.get() * src.get()))
	},
	DIV: {
		locs: [[/reg/, /$/]],
		func: (dst, src) => setFlags(dst.set(dst.get() / src.get()))
	},
	NEG: {
		locs: [[/reg/]],
		func: (dst) => setFlags(dst.set(-dst.get()))
	},
	MOD: {
		locs: [[/reg/, /$/]],
		func: (dst, src) => setFlags(dst.set(dst.get() % src.get()))
	},
	CMP: {
		locs: [[/reg/, /$/], [/mem/, /(reg|imm)/]],
		func: (lhs, rhs) => setFlags(lhs.get() - rhs.get())
	},
	JE: {
		locs: [[/imm/]],
		func: (instruction) => m.eflags.zf && (m.eflags.jf = true) && prop.reg('eip').set(instruction.get())
	},
	JNE: {
		locs: [[/imm/]],
		func: (instruction) => !m.eflags.zf && (m.eflags.jf = true) && prop.reg('eip').set(instruction.get())

	},
	JL: {
		locs: [[/imm/]],
		func: (instruction) => m.eflags.sf && (m.eflags.jf = true) && prop.reg('eip').set(instruction.get())
	},
	JLE: {
		locs: [[/imm/]],
		func: (instruction) => m.eflags.sf || m.eflags.zf && (m.eflags.jf = true) && prop.reg('eip').set(instruction.get())
	},
	JG: {
		locs: [[/imm/]],
		func: (instruction) => !m.eflags.sf && !m.eflags.zf && (m.eflags.jf = true) && prop.reg('eip').set(instruction.get())
	},
	JGE: {
		locs: [[/imm/]],
		func: (instruction) => !m.eflags.sf && (m.eflags.jf = true) && prop.reg('eip').set(instruction.get())
	}
	
	// NEG: 
	// ABS:
	// SQRT:
	// ROUND:
	// POW:
	// LOG:
	// SIN:
	// COS:
	// TAN:
	// CTG:
	// ASIN:
	// ACOS:
	// ATAN:
	// ACTG:
	// SINH:
	// COSH:
	// TANH:
	// CTGH:
	// ASINH:
	// ACOSH:
	// ATANH:
	// ACTGH:
	// ...
	// CMP:
	// TEST:
	// LNOT:
	// LAND:
	// LOR:
	// JMP:
	// JE:
	// JNE:
	// JL:
	// JLE:
	// JG:
	// JGE:
	// ...
	// BNOT:
	// BAND:
	// BOR:

};

async function interruption(id)
{
	switch (id) {
	case 0:
		return m.eflags.xf = true;
	case 1:
		return prop.reg('eax').set(
			await new Promise(resolve =>
				process.stdin.once('data', data => resolve(parseFloat(data)))
			)
		);
	case 2:
		for(;;) {
			const char = prop.mem('esp', +1).get();

			prop.reg('esp').set(prop.reg('esp').get() + 1);

			if (!char)
				break;

			process.stdout.write(chalk.cyan(String.fromCharCode(char)));
		}
		break;
	case 3:
		return console.log(chalk.cyan(prop.reg('eax').get()));
	default:
		throw new Error(`No such interruption: ${id}`);
	}
}


function getParam(addr)
{
	const reg = /^(eax|ebx|ecx|edx|esi|edi|ebp|esp)$/;
	const mem = /^\[(eax|ebx|ecx|edx|esi|edi|ebp|esp)?([+|-]?\d+)?\]$/;

	if(isFinite(addr))
		return prop.imm(Number.parseFloat(addr));
	else if(reg.test(addr))
		return prop.reg(addr);
	else if(mem.test(addr))
		return prop.mem(mem.exec(addr)[1], Number.parseInt(mem.exec(addr)[2]));
	else
		throw new Error(`Invalid addressation type: ${addr}`);
}

function checkLocs(allowed)
{
	return function(args) {
		const config = _.find(allowed, config =>
			config.length == args.length &&
			config.every((loc, index) => loc.test(args[index].loc))
		);

		if (!config)
			throw new Error('Invalid command configuration');
		else
			// console.log(`Scheme match: ${config.map(regex => regex.source).join(', ')}`)
			;

		return args;
	};
}

const prop = {
	reg: reg => ({
		loc: 'reg',
		get: ( ) => m[reg],
		set: (x) => m[reg] = R(x)
	}),
	mem: (reg, offset) => ({
		loc: 'mem',
		get: ( ) => m.stack[M(reg, offset)],
		set: (x) => m.stack[M(reg, offset)] = R(x)
	}),
	imm: imm => ({
		loc: 'imm',
		get: ( ) => R(imm),
		set: (x) => {throw new Error(`Cannot assign value ${R(x)} to immediate`);}
	})
};

function R(value)
{
	if (!Number.isFinite(value))
		throw new Error(`${value} is not an assembler value`);

	return value;
}

function M(reg, offset)
{
	const addr = (reg && R(m[reg]) || 0) + (offset || 0);

	if (!Number.isInteger(addr))
		throw new Error(`Not a memory cell: ${addr}`);

	if (addr < 0)
		throw new Error(`Segmentation fault (stack overflow at ${addr})`);

	if (addr <= m.esp)
		throw new Error(`Segmentation fault (stack pointer overflow at ${addr})`);

	if (addr >= STACK_SIZE)
		throw new Error(`Segmentation fault (stack underflow at ${addr})`);

	return addr;
}

function I(addr)
{
	if (!Number.isInteger(addr))
		throw new Error(`Not an instruction cell: ${addr}`);

	if (addr < 0)
		throw new Error(`Segmentation fault (instruction ${addr})`);

	if (addr >= m.code.length)
		throw new Error(`Segmentation fault (instruction ${addr} > ${m.code.length - 1})`);

	return addr;
}


function setFlags(res)
{
	m.eflags.zf = res === 0;
	m.eflags.sf = res < 0;
}


function printState(prevState, eip)
{
	const result = new Array(10).fill('   ');
	const diff = getDiff(prevState, m);

	for (let i = 0; i < 10; i++)
		if (eip - 3 + i < 0 || eip - 3 + i >= m.code.length)
			result[i] += ' '.repeat(40);
		else
			result[i] +=
				(i === 3 ? '> ' : '  ') +
				`${eip - 3 + i}:   `.padStart(8) +
				m.code[eip - 3 + i].mnemonics.padEnd(7) + ' ' +
				m.code[eip - 3 + i].args.join(', ').padEnd(22);

	result[3] = chalk.yellow(result[3]);

	const stack = _.union(diff.stack, _.range(m.esp + 1, m.esp + 11))
		.slice(0, 10).sort((x, y) => x - y);

	for (let i = 0; i < 10; i++)
		result[i] += stack[i] < m.stack.length ?
			maybeRed(_.includes(diff.stack, stack[i]))(
				`${stack[i] - m.ebp > 0 ? '+' : ''}${m.ebp !== stack[i] ? stack[i] - m.ebp : 'ebp'}:   `.padStart(9) +
				`${stack[i]}: `.padStart(6) +
				`${m.stack[stack[i]]}`.padStart(24)
			) :
			' '.repeat(39);

	for (let i = 0; i < 10; i++)
		result[i] += ' '.repeat(10);

	result[0] += maybeRed(diff.eip)('eip: ' + `${m.eip}`.padStart(24));
	result[1] += maybeRed(diff.esp)('esp: ' + `${m.esp}`.padStart(24));
	result[2] += maybeRed(diff.ebp)('ebp: ' + `${m.ebp}`.padStart(24));
	result[3] += maybeRed(_.values(diff.eflags).some(_.identity))('eflags: ') +
		' '.repeat(14) + _.keys(m.eflags).map(flag =>
			maybeRed(diff.eflags[flag])(`${m.eflags[flag] ? flag[0] : '_'}`)
		).join(' ');
	result[4] += maybeRed(diff.eax)('eax: ' + `${m.eax}`.padStart(24));
	result[5] += maybeRed(diff.ebx)('ebx: ' + `${m.ebx}`.padStart(24));
	result[6] += maybeRed(diff.ecx)('ecx: ' + `${m.ecx}`.padStart(24));
	result[7] += maybeRed(diff.edx)('edx: ' + `${m.edx}`.padStart(24));
	result[8] += maybeRed(diff.esi)('esi: ' + `${m.esi}`.padStart(24));
	result[9] += maybeRed(diff.edi)('edi: ' + `${m.edi}`.padStart(24));

	process.stdout.write(`\n${result.join('\n')}\n`);

	function getDiff(m1, m2)
	{
		const diff = _.chain(m1)
			.keys()
			.without('eip', 'eflags', 'stack', 'code')
			.reject(key => m1[key] === m2[key] && !(_.isNaN(m1[key]) && _.isNaN(m2[key])))
			.map(key => [key, true])
			.fromPairs()
			.value();

		diff.eip = m2.eflags.jf;
	
		diff.stack = _.reject(
			_.range(0, Math.max(m1.stack.length, m2.stack.length)),
			index => m1.stack[index] === m2.stack[index] && !(_.isNaN(m1.stack[index]) && _.isNaN(m2.stack[index]))
		);
	
		diff.eflags = {
			zf: m1.eflags.zf !== m2.eflags.zf,
			sf: m1.eflags.sf !== m2.eflags.sf,
			xf: m1.eflags.xf !== m2.eflags.xf,
			jf: m1.eflags.jf !== m2.eflags.jf
		};
	
		return diff;
	}

	function maybeRed(condition)
	{
		return function(str)
		{
			return condition ? chalk.red(str) : str;
		};
	}
}
