const rules = {
	1: {lhs: 'S', rhs: 'E'},
	2: {lhs: 'E', rhs: '+(E,E)'},
	3: {lhs: 'E', rhs: 'a'}
};

const init = 'S';

const select = {
	'S': {
		'+': 1,
		'a': 1
	},
	'E': {
		'+': 2,
		'a': 3
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
		return {type: 'value', loc: {type: 'id', id: a}};
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
		usedRegs: {eax: false, ebx: false, ecx: false, edx: false, esi: false, edi: false},
		busyRegs: {eax: false, ebx: false, ecx: false, edx: false, esi: false, edi: false},
		scope: Object.assign({},
			state.globals,
			args,
			locals
		)
	};

	const expr = expression(state, subCgState, body.root);

	const regSave = [
		
	]
	


	return {
		out: [
			`${cgState.func}:`,
			'        PUSH    ebp',
			'        MOV     ebp, esp',
			`        ADD     ebp, ${1 + func.args.length}`,
			`        SUB     esp, ${func.locals.length}`,
			...expr.out,
			'        MOV     esp, ebp',
			'        POP     ebp'
		]
	};
}

function expression(state, cgState, expr)
{
	// if (expr.type === 'op')
	// {
	// 	const lhs = expression(state, expr.lhs);
	// 	const rhs = expression(state, expr.rhs);

	// 	switch (lhs.loc)
	// 	{
	// 		case 'reg'
	// 	}

	// 	switch (lhs.loc) {
			
	// 	}

	// 	if ()

	// 	return {
	// 		out: [
	// 			...lhs.out,
	// 			...rhs.out,
	// 			`        ${expr.op}`
	// 		]
	// 	};
	// }
	// else
	// {
	// 	expr.out = [];

	// 	return expr;


	// 	switch (expr.loc)
	// 	{
	// 		case 'stack':
	// 			return 
	// 	}

	// 	if (cgState.) {

	// 	}

	// 	return {
	// 		loc: {type: 'stack'},
	// 		out: [`        PUSH    ${expr.value}`]
	// 	};
	// }
}
