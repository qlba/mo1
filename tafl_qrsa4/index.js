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
		return {type: 'expression', root: E};
	},
	2: (state, [,,E1,,E2]) =>
	{
		return {type: 'operation/add', mnemonics: 'ADD', commutative: true, lhs: E1, rhs: E2};
	},
	3: (state, [a]) =>
	{
		return {type: 'value/id', id: a};
	},
	4: (state, [v]) =>
	{
		return {type: 'value/literal', value: v};
	}
};


const Syntan = require('./syntan');
const syntan = new Syntan(rules, init, select, postproc);

const state = {};

const parsed = syntan.parse(state, '+(+(a,a),+(a,a))');

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
		locals: [
			{id: 'a'},
			{id: 'b'},
			{id: 'c'}
		]
	};

	return func(state, main, parsed);
}

function func(state, func, body)
{
	const locals = {};

	for (let i = 0; i < func.locals.length; i++)
	{
		const local = func.locals[i];

		if (locals[local.id])
			throw new Error(`Local variable ${local.id} redeclaration in function ${func.name}`);

		locals[local.id] = {
			loc: {
				type: 'm',
				addr: `[ebp${-i || undefined}]`
			}
		};
	}

	const scope = {
		vars: Object.assign({},
			locals
		),
		funcs: {}
	};

	const expr = expression(state, scope, [], body.root, []);

	return {
		out: [
			`${cgState.func}:`,
			...expr.out,
			expr.loc.addr === 'eax' || `        MOV     eax, ${expr.loc.addr}`
		]
	};
}

function expression(state, scope, busyRegs, expr, usedRegs)
{
	const type = expr.type.split('/');

	if (type[0] === 'operation')
	{
		const lhs = expression(state, scope, busyRegs, expr.lhs, usedRegs);
		const rhs = expression(state, scope, busyRegs, expr.rhs, usedRegs);

		const out = [...lhs.out, ...rhs.out];

		if (lhs.loc.type === 'r') {
			out.push(`        ${expr.mnemonics.padEnd(7)} ${lhs.loc.addr}, ${rhs.loc.addr}`);
			return {out, loc: lhs.loc};
		}

		if (rhs.loc.type === 'r' && expr.commutative) {
			out.push(`        ${expr.mnemonics.padEnd(7)} ${rhs.loc.addr}, ${lhs.loc.addr}`);
			return {out, loc: rhs.loc};
		}

		if (rhs.loc.type === 'r' && !expr.commutative) {
			out.push(`        ${expr.mnemonics.padEnd(7)} ${rhs.loc.addr}, ${lhs.loc.addr}`);
			out.push(`        ${expr.mnemonics.padEnd(7)} ${rhs.loc.addr}, ${lhs.loc.addr}`);
			return {out, loc: rhs.loc};
		}

		

		// switch (lhs.loc.type)
		// {
		// case 'stack':
		// 	out.push(`        MOV     ${X}, [ebp${-lhs.loc.disp || undefined}]`);
		// }

		// switch (lhs.loc) {
			
		// }

		throw new Error();

		// return {
		// 	out
		// };
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
