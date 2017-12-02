const chalk = require('chalk');
const _ = require('lodash');

const m = {
	eax: undefined,
	ebx: undefined,
	ecx: undefined,
	edx: undefined,
	esi: undefined,
	edi: undefined,
	esp: undefined,
	ebp: undefined,
	eip: undefined,
	eflags: {
		zf: undefined,
		sf: undefined
	},
	stack: new Array(1024)
};

let mPrev = _.cloneDeep(m);

function opCycle() {
	// exec(op);

	printState(getDiff(mPrev, m));
	mPrev = _.cloneDeep(m);
}

function printState(diff)
{
	const result = new Array(10).fill('   ');

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

	function maybeRed(condition)
	{
		return function(str)
		{
			return condition ? chalk.red(str) : str;
		};
	}
}

function getDiff(m1, m2)
{
	const diff = _.chain(m1)
		.keys()
		.without('eflags', 'stack', 'code')
		.reject(key => m1[key] === m2[key] && !(_.isNaN(m1[key]) && _.isNaN(m2[key])))
		.map(key => [key, true])
		.fromPairs()
		.value();

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


