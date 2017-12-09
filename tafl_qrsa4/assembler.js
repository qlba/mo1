const _ = require('lodash');


const regs = ['eax', 'ecx', 'edx', 'ebx', 'esi', 'edi'];

const operations = {
	'add': {
		mnemonics: 'ADD',
		commutative: true
	},
	'sub': {
		mnemonics: 'SUB',
		shiftable: true
	},
	'mul': {
		mnemonics: 'MUL',
		commutative: true
	},
	'div': {
		mnemonics: 'DIV'
	},
	'neg': {
		mnemonics: 'NEG'
	}
};


module.exports = function entry(state, parsed)
{
	return program(state, parsed);
};

function program(state, parsed)
{
	const main = {
		name: 'main',
		args: [
			// {id: 'd'},
			// {id: 'e'},
			// {id: 'f'}
		],
		locals: [
			{id: 'a'},
			{id: 'b'},
			{id: 'c'}
		]
	};

	return {
		out: [
			'        NOP',
			'        CALL    3',
			'        INT     0',
			...func(state, main, parsed).out
		]
	};
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
				addr: `[ebp+${2 + func.args.length - i}]`
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
				addr: `[ebp${-i || ''}]`
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
			// `${func.name}:`,
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

function expression(state, scope, freeRegs, expr, usedRegs)
{
	const type = expr.type.split('/');
	const out = [];
	let loc, pushes = 0;

	if (type[0] === 'operation')
	{
		const op = operations[type[2]];

		if (type[1] === 'binary')
		{
			const lhs = expression(state, scope, freeRegs, expr.lhs, usedRegs);
			out.push.apply(out, lhs.out);

			const lhsReg = lhs.loc.type === 'r' && lhs.loc.addr;
			const freeRegsForRhs = _.without(freeRegs, lhsReg);

			const pushLhs = freeRegsForRhs.length < 1 && lhsReg;
			
			if (pushLhs)
			{
				lhs.loc = {type: 'm', addr: '[esp+1]'};
				out.push(`        PUSH    ${pushLhs}`);

				pushes++;
			}

			const rhs = expression(state, scope, pushLhs ? freeRegs : freeRegsForRhs, op.rhs, usedRegs);
			out.push.apply(out, rhs.out);

			if (lhs.loc.type === 'r')
			{
				out.push(`        ${op.mnemonics.padEnd(7)} ${lhs.loc.addr}, ${rhs.loc.addr}`);
				loc = lhs.loc;
			}
			else if (rhs.loc.type === 'r' && op.commutative)
			{
				out.push(`        ${op.mnemonics.padEnd(7)} ${rhs.loc.addr}, ${lhs.loc.addr}`);
				loc = rhs.loc;
			}
			else if (rhs.loc.type === 'r' && op.shiftable)
			{
				out.push(`        ${op.mnemonics.padEnd(7)} ${lhs.loc.addr}, ${rhs.loc.addr}`);
				loc = lhs.loc;
			}
			else if (rhs.loc.type === 'r')
			{
				out.push(`        PUSH    ${rhs.loc.addr}`);
				pushes++;

				if (pushLhs)
					lhs.loc = {type: 'm', addr: '[esp+2]'};

				out.push(`        MOV     ${rhs.loc.addr}, ${lhs.loc.addr}`);
				out.push(`        ${op.mnemonics.padEnd(7)} ${rhs.loc.addr}, [esp+1]`);

				loc = rhs.loc;
			}
			else
			{
				const reg = _.first(pushLhs ? freeRegs : freeRegsForRhs);

				if (!reg)
					throw new Error('Register file overload');

				usedRegs[reg] = true;

				out.push(`        MOV     ${reg}, ${lhs.loc.addr}`);
				out.push(`        ${op.mnemonics.padEnd(7)} ${reg}, ${_.isEqual(lhs.loc, rhs.loc) ? reg : rhs.loc.addr}`);
				loc = {type: 'r', addr: reg};
			}

			if (pushes)
				out.push(`        ADD     esp, ${pushes}`);

			return {out, loc};
		}
		else 
			throw new Error();
	}
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
	// else if (type[0] === 'call')
	// {

	// }
	else 
		throw new Error();
}
