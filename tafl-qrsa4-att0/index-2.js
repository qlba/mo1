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

// fucntion execute() {
// }

function printState()
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

	for (let i = 0; i < 10; i++)
		result[i] += m.esp + i + 1 < m.stack.length ?
			`${m.esp + i + 1}: `.padStart(6) + `${m.stack[m.esp + i + 1]}`.padStart(24) :
			' '.repeat(30);

	for (let i = 0; i < 10; i++)
		result[i] += ' '.repeat(10);

	result[0] += 'eip: ' + `${m.eip}`.padStart(24);
	result[1] += 'esp: ' + `${m.esp}`.padStart(24);
	result[2] += 'ebp: ' + `${m.ebp}`.padStart(24);
	result[3] += ' '.repeat(29);
	result[4] += chalk.red('eax: ' + `${m.eax}`.padStart(24));
	result[5] += 'ebx: ' + `${m.ebx}`.padStart(24);
	result[6] += 'ecx: ' + `${m.ecx}`.padStart(24);
	result[7] += 'edx: ' + `${m.edx}`.padStart(24);
	result[8] += 'esi: ' + `${m.esi}`.padStart(24);
	result[9] += 'edi: ' + `${m.edi}`.padStart(24);

	process.stdout.write(`\n${result.join('\n')}\n`);
}


m.esp = 1018;
m.stack[1023] = 4;
m.stack[1022] = 3;
m.stack[1021] = -132235.236547324652e-110;
m.stack[1020] = 1;
m.stack[1019] = 0;
m.eax = 230;
m.code = [
	{mnemonics: 'PUSH', args: ['ebp']},
	{mnemonics: 'MOV', args: ['ebp', 'esp']},
	{mnemonics: 'SUB', args: ['esp', 16]},
	{mnemonics: 'ADD', args: ['eax', 200]},
	{mnemonics: 'MOV', args: ['[ebp-8]', 'eax']},
	{mnemonics: 'XCHG', args: ['edx', 'eax']},
	{mnemonics: 'MUL', args: ['eax', 'edx']}
];
m.eip = 2;

printState();
