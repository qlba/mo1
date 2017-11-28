const _ = require('lodash');


const rules = {
	1: {lhs: 'S', rhs: 'E'},
	2: {lhs: 'E', rhs: '+(E,E)'},
	3: {lhs: 'E', rhs: '-(E,E)'},
	4: {lhs: 'E', rhs: '*(E,E)'},
	5: {lhs: 'E', rhs: '/(E,E)'},
	6: {lhs: 'E', rhs: 'a'},
	7: {lhs: 'E', rhs: '1'}
};

const init = 'S';

const select = {
	'S': {
		'+': 1,
		'-': 1,
		'*': 1,
		'/': 1,
		'a': 1,
		'1': 1
	},
	'E': {
		'+': 2,
		'-': 3,
		'*': 4,
		'/': 5,
		'a': 6,
		'1': 7
	}
};

const postproc = {
	1: (state, [E]) =>
	{
		return {type: 'expression', root: E};
	},
	2: (state, [,,E1,,E2]) =>
	{
		return {type: 'operation/add', mnemonics: 'ADD', commutative: true, lhs: E1, rhs: E2};
	},
	3: (state, [,,E1,,E2]) =>
	{
		return {type: 'operation/sub', mnemonics: 'SUB', shiftable: true, lhs: E1, rhs: E2};
	},
	4: (state, [,,E1,,E2]) =>
	{
		return {type: 'operation/mul', mnemonics: 'MUL', commutative: true, lhs: E1, rhs: E2};
	},
	5: (state, [,,E1,,E2]) =>
	{
		return {type: 'operation/div', mnemonics: 'DIV', lhs: E1, rhs: E2};
	},
	6: (state, [a]) =>
	{
		return {type: 'value/id', id: a.value};
	},
	7: (state, [v]) =>
	{
		return {type: 'value/literal', value: v.value};
	}
};


const regs = ['eax', 'ecx'];
//const regs = ['eax', 'ecx', 'edx', 'ebx', 'esi', 'edi'];


const Syntan = require('./syntan');
const syntan = new Syntan(rules, init, select, postproc);

const state = {};

const tokens = [
	{type: '-'},
	{type: '('},
	{type: 'a', value: 'b'},
	{type: ','},
	{type: '+'},
	{type: '('},
	{type: '1', value: 2},
	{type: ','},
	{type: '1', value: 2},
	{type: ')'},
	{type: ')'},
	{type: '$'}
];

const parsed = syntan.parse(state, tokens);

console.dir(parsed, {depth: null});

if (!parsed.accept)
	process.exit(-1);

// state.globals = [];

// state.funcs = {
// 	main: {
// 		args: [
// 			{id: 'a'}
// 		],
// 		locals: [
// 			{id: 'b'}
// 		]
// 	}
// };

// console.dir(parsed.accept && parsed.result, {depth: null});
console.log(entry(state, parsed.result).out.join('\n'));




function entry(state, parsed)
{
	const main = {
		name: 'main',
		args: [
			{id: 'a'},
			{id: 'b'},
			{id: 'c'}
		],
		locals: [
			{id: 'd'},
			{id: 'e'},
			{id: 'f'}
		]
	};

	return func(state, main, parsed);
}

function func(state, func, body)
{
	const args = {};

	for (let i = 0; i < func.args.length; i++)
	{
		const arg = func.args[i];

		if (args[arg.id])
			throw new Error(`Ambiguous definition of argument ${arg.id} in function ${func.name}`);

		args[arg.id] = {
			loc: {
				type: 'm',
				addr: `[ebp${i - 2 - func.locals.length}]`
			}
		};
	}

	const locals = {};

	for (let i = 0; i < func.locals.length; i++)
	{
		const local = func.locals[i];

		if (args[local.id])
			throw new Error(`Ambiguous definition of argument/variable ${local.id} in function ${func.name}`);

		if (locals[local.id])
			throw new Error(`Ambiguous definition of variable ${local.id} in function ${func.name}`);

		locals[local.id] = {
			loc: {
				type: 'm',
				addr: `[ebp${i ? `+${i}` : ''}]`
			}
		};
	}

	const scope = {
		vars: Object.assign({}, args, locals),
		funcs: {}
	};

	const usedRegs = {};

	const expr = expression(state, scope, regs, body.root, usedRegs);

	return {
		out: [
			`${func.name}:`,
			'        PUSH    ebp',
			'        MOV     ebp, esp',
			`        SUB     esp, ${func.locals.length}`,
			..._(usedRegs).keys().without('eax').map(reg => `        PUSH    ${reg}`).value(),
			...expr.out,
			...(expr.loc.addr === 'eax' ? [] : [`        MOV     eax, ${expr.loc.addr}`]),
			..._(usedRegs).keys().without('eax').reverse().map(reg => `        POP     ${reg}`).value(),
			'        MOV     esp, ebp',
			'        POP     ebp',
			'        RET'
		]
	};
}

// expressionRoot?
// 6expression?

function expression(state, scope, freeRegs, expr, usedRegs)
{
	const type = expr.type.split('/');
	const out = [];
	let loc;

	if (type[0] === 'operation')
	{
		const lhs = expression(state, scope, freeRegs, expr.lhs, usedRegs);
		out.push.apply(out, lhs.out);

		const lhsReg = lhs.loc.type === 'r' && lhs.loc.addr;
		const freeRegsForRhs = _.without(freeRegs, lhsReg);

		const pushReg = freeRegsForRhs.length < 1 && lhsReg;
		
		if (pushReg)
		{
			out.push(`        PUSH    ${pushReg}`);
			lhs.loc = {type: 'm', addr: '[esp+1]'};
		}

		const rhs = expression(state, scope, freeRegsForRhs, expr.rhs, usedRegs);
		out.push.apply(out, rhs.out);


		else if (lhs.loc.type === 'r' || rhs.loc.type === 'r' && !expr.commutative)
		{
			if (!expr.shiftable) {
				out.push(`        PUSH    ${rhs.loc.addr}`);
				out.push(`        MOV     ${rhs.loc.addr}, ${lhs.loc.addr}`);

				rhs.loc.addr = {
					type: 'm', addr: '[esp+1]'
				};
			}

			out.push(`        ${expr.mnemonics.padEnd(7)} ${lhs.loc.addr}, ${rhs.loc.addr}`);
			loc = lhs.loc;
		}
		else if (rhs.loc.type === 'r' && expr.commutative)
		{
			out.push(`        ${expr.mnemonics.padEnd(7)} ${rhs.loc.addr}, ${lhs.loc.addr}`);
			loc = rhs.loc;
		}
		else
		{
			const reg = _(freeRegsForRhs).without(rhs.loc.type === 'r' && rhs.loc.addr).first();
			
			console.dir(freeRegsForRhs);

			usedRegs[reg] = true;

			if (!reg)
				throw new Error('Register file overload');

			out.push(`        MOV     ${reg}, ${lhs.loc.addr}`);
			out.push(`        ${expr.mnemonics.padEnd(7)} ${reg}, ${_.isEqual(lhs.loc, rhs.loc) ? reg : rhs.loc.addr}`);
			loc = {type: 'r', addr: reg};
		}

		if (pushReg)
			out.push(`        ADD     esp, 1`);

		return {out, loc};
	}
	// else if (type[0] === 'call')
	// {
		
	// }	
	else if (type[0] === 'value')
	{
		if (type[1] === 'id')
		{
			if (!scope.vars[expr.id])
				throw new Error(`Undefined reference to ${expr.id}`);

			return {
				out: [],
				loc: scope.vars[expr.id].loc
			};
		}
		else if (type[1] === 'literal')
		{
			return {
				out: [],
				loc: {
					type: 'imm',
					addr: expr.value
				}
			};
		}
		else
			throw new Error();
	}
	else 
		throw new Error();
}
