const _ = require('lodash');

const rules = {
	1: {lhs: 'S', rhs: 'E'},
	2: {lhs: 'E', rhs: '+(E,E)'},
	3: {lhs: 'E', rhs: 'a'},
	4: {lhs: 'E', rhs: '1'}
};

const init = 'S';

const select = {
	'S': {
		'+': 1,
		'a': 1,
		'1': 1
	},
	'E': {
		'+': 2,
		'a': 3,
		'1': 4
	}
};

const postproc = {
	1: (state, [E]) =>
	{
		return {type: 'expr', root: E};
	},
	2: (state, [,,E1,,E2]) =>
	{
		return {type: 'op', op: 'ADD', lhs: E1, rhs: E2};
	},
	3: (state, [a]) =>
	{
		return {type: 'id', id: a};
	},
	4: (state, [v]) =>
	{
		return {type: 'imm', value: v};
	}
};




const Syntan = require('./syntan');
const syntan = new Syntan(rules, init, select, postproc);

const state = {};

const parsed = syntan.parse(state, '+(+(a,a),+(a,a))');

if (!parsed.accept)
	process.exit(-1);

state.globals = [];

state.funcs = {
	main: {
		args: [
			{id: 'a'}
		],
		locals: [
			{id: 'b'}
		]
	}
};

// console.dir(parsed.accept && parsed.result, {depth: null});
console.log(entry(state, {}, parsed.result).out.join('\n'));


function entry(state, cgState, parsed)
{
	return func(state, {func: 'main'}, parsed);
}

function func(state, cgState, body)
{
	const name = cgState.func;
	const func = state.funcs[cgState.func];

	const args = {};

	for (let i = 0; i < func.args.length; i++)
	{
		const arg = func.args[i];

		if (args[arg.id])
			throw new Error(`Argument ${arg.id} redeclaration in function ${name}`);

		args[arg.id] = {
			loc: {
				type: 'stack',
				disp: i
			}
		};
	}

	const locals = {};

	for (let i = 0; i < func.locals.length; i++)
	{
		const local = func.locals[i];

		if (args[local.id])
			throw new Error(`Local variable ${local.id} declaration over argument in function ${name}`);

		if (locals[local.id])
			throw new Error(`Local variable ${local.id} redeclaration in function ${name}`);

		locals[local.id] = {
			loc: {
				type: 'stack',
				disp: func.args.length + 1 + i
			}
		};
	}

	const subCgState = {
		usedRegs: [],
		scope: Object.assign({},
			state.globals,
			args,
			locals
		)
	};

	const expr = expression(state, subCgState, [], body.root);

	return {
		out: [
			`${cgState.func}:`,
			'        PUSH    ebp',
			'        MOV     ebp, esp',
			`        ADD     ebp, ${1 + func.args.length}`,
			`        SUB     esp, ${func.locals.length}`,
			...subCgState.usedRegs.map(reg => `        PUSH    ${reg}`),
			...expr.out,
			...subCgState.usedRegs.map(reg => `        POP     ${reg}`).reverse(),
			'        MOV     esp, ebp',
			'        POP     ebp'
		]
	};
}

function expression(state, cgState, busyRegs, expr)
{
	if (expr.type === 'op')
	{
		const lhs = expression(state, cgState, expr.lhs);
		const rhs = expression(state, cgState, expr.rhs);

		const out = [...lhs.out, ...rhs.out];

		if (lhs.loc.type !== 'reg' && rhs.loc.type !== 'reg')
		{
			var freeReg = _.difference(regs, busyRegs)[0];

			if(!freeReg)
				out.push(`        PUSH    ${regs[0]}`);

			

			if(!freeReg)
				out.push(`        XCHG    ${regs[0]}, [esp-1]`);
		}

		switch (lhs.loc.type)
		{
		case 'stack':
			out.push(`        MOV     ${X}, [ebp${-lhs.loc.disp || undefined}]`);
		}

		switch (lhs.loc) {
			
		}

		out.push(`        ${expr.op}`);

		return {
			out
		};
	}
	else if (expr.type === 'id')
	{
		if (!cgState.scope[expr.id])
			throw new Error(`Undefined reference to ${expr.id}`);

		return cgState.scope[expr.id];
	}
	else if (expr.type === 'imm')
	{
		return {loc: expr};
	}
	else 
		throw new Error();

	// switch (expr.loc)
	// {
	// 	case 'stack':
	// 		return 
	// }

	// if (cgState.) {

	// }

	// return {
	// 	loc: {type: 'stack'},
	// 	out: [`        PUSH    ${expr.value}`]
	// };
}
