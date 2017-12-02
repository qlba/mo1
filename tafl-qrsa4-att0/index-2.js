const pEachSeries = require('p-each-series');
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
		zf: undefined,
		sf: undefined
	},
	stack: new Array(STACK_SIZE)
};

let mPrev = _.cloneDeep(m);


async function run(asm) {
	await pEachSeries(_.compact(asm.split('\n')), async line =>
	{
		const [mnemonics, ...args] = _.compact(line.split(/[ ,]/));

		if (!commands[mnemonics])
			throw new Error(`Unknown command: ${mnemonics}`);

		commands[mnemonics].func(
			...checkLocs(commands[mnemonics].locs)(args.map(getParam))
		);

		printState(mPrev);
		mPrev = _.cloneDeep(m);

		await new Promise((resolve) => setTimeout(resolve, 1000));
	});
}

const commands = {
	NOP: {
		locs: [[]],
		func: () => 0
	},
	MOV: {
		locs: [
			[/reg/, /$/], [/mem/, /reg/]
		],
		func: (dst, src) => dst.set(src.get())
	}
};


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
		if (!allowed.some(
			config => args.every((arg, index) => config[index].test(arg.loc))
		))
			throw new Error('Invalid command configuration');

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

	if (addr <= this.esp)
		throw new Error(`Segmentation fault (stack pointer overflow at ${addr})`);

	if (addr >= STACK_SIZE)
		throw new Error(`Segmentation fault (stack underflow at ${addr})`);

	return addr;
}


function setFlags(res)
{
	m.eflags.zf = res === 0;
	m.eflags.sf = res < 0;
}


function printState(prevState)
{
	const result = new Array(10).fill('   ');
	const diff = getDiff(prevState, m);
	
	for (let i = 0; i < 10; i++)
		if (m.eip - 3 + i < 0 || m.eip - 3 + i >= m.code.length)
			result[i] += ' '.repeat(40);
		else
			result[i] +=
				(i === 3 ? '> ' : '  ') +
				`${m.eip - 3 + i}:   `.padStart(8) +
				m.code[m.eip - 3 + i].mnemonics.padEnd(7) + ' ' +
				m.code[m.eip - 3 + i].args.join(', ').padEnd(22);

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
			' '.repeat(30);

	for (let i = 0; i < 10; i++)
		result[i] += ' '.repeat(10);

	result[0] += maybeRed(diff.eip)('eip: ' + `${m.eip}`.padStart(24));
	result[1] += maybeRed(diff.esp)('esp: ' + `${m.esp}`.padStart(24));
	result[2] += maybeRed(diff.ebp)('ebp: ' + `${m.ebp}`.padStart(24));
	result[3] += maybeRed(diff.eflags.sf || diff.eflags.zf)('eflags: ') +
		' '.repeat(18) +
		maybeRed(diff.eflags.zf)(`${m.eflags.zf ? 'z' : ' '}`) + ' ' +
		maybeRed(diff.eflags.sf)(`${m.eflags.sf ? 's' : ' '}`);
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

		diff.eip = m2.eip !== m1.eip + 1;
	
		diff.stack = _.reject(
			_.range(0, Math.max(m1.stack.length, m2.stack.length)),
			index => m1.stack[index] === m2.stack[index] && !(_.isNaN(m1.stack[index]) && _.isNaN(m2.stack[index]))
		);
	
		diff.eflags = {
			zf: m1.eflags.zf !== m2.eflags.zf,
			sf: m1.eflags.sf !== m2.eflags.sf
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


// ---------

run(`
        MOV     eax, 3
`);
