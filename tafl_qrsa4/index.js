const _ = require('lodash');

const grammar = `
	<программа> -> BEGIN <операторы> END
	<переменные> -> идентификатор , <переменные>
	<переменные> -> идентификатор
	<операторы> -> <оператор> <операторы>
	<операторы> -> <оператор>
	<оператор> -> VAR <переменные>;
	<оператор> -> READ идентификатор ;
	<оператор> -> WRITE идентификатор ;
	<оператор> -> <переменные> := <выражение>;
	<оператор> -> REPEAT <операторы> UNTIL <отношение>;
	<выражение> -> <выражение> + <терм>
	<выражение> -> <выражение> – <терм>
	<выражение> -> <терм>
	<терм> -> <терм> * <множитель>
	<терм> -> <терм> / <множитель>
	<терм> -> <множитель>
	<множитель> -> идентификатор
	<множитель> -> число
	<множитель> -> (<выражение>)
	<множитель> -> – (<выражение>)
	<отношение> -> <идентификатор> операция_отношения <выражение>
`;

`
	<program> -> <ops>

	<ops> -> <op>;<ops>
	<ops> -> U

	<op> -> <id>: <op>

	<op> -> { <ops> }
	<op> -> <op>, <op>
	<op> -> FUNCTION <id>(<vdecls>) { <ops> }
	<op> -> CONST <cdecls>
	<op> -> VAR <vdecls>
	<op> -> <expr>
	<op> -> IF (<expr>) <op>
	<op> -> IF (<expr>) <op> ELSE <op>
	<op> -> SWITCH (<expr>) { <selector_body> }
	<op> -> WHILE (<expr>) <op>
	<op> -> DO <op> WHILE (<expr>)
	<op> -> REPEAT <op> UNTIL (<expr>)
	<op> -> FOR (<op>;<expr>;<op>) <op>
	<op> -> GOTO <id>
	<op> -> BREAK
	<op> -> CONTINUE
	<op> -> RETURN <expr>
	<op> -> RETURN


	<selector_body> -> <selector_op> <selctor_body>
	<selector_body> -> U

	<selector_op> -> <selector_match>:
	<selector_op> -> <op>

	<selector_match> -> CASE <expr>
	<selector_match> -> DEFAULT


	<cdecls> -> <cdecl>, <cdecls>
	<cdecls> -> U

	<vdecls> -> <vdecl>, <vdecls>
	<vdecls> -> <cdecl>, <vdecls>
	<vdecls> -> U

	<cdecl> -> <id> = <expr>
	<vdecl> -> <id>


	--<expr> -> <expr> <binop> <expr>
	--<expr> -> <unop> <expr>
	--<expr> -> <expr> <unop>

	<expr> -> <id>(<expr_list>)
	<expr> -> (<expr>)
	<expr> -> 


	<expr_list> -> <expr>, <expr_list>
	<expr_list> -> U
`;

const rules = {
	1: {lhs: '<P>', rhs: ['begin', '<Os>', 'end']},
	2: {lhs: '<Os>', rhs: ['<O>', '<Os>']},
	3: {lhs: '<Os>', rhs: []},
	4: {lhs: '<O>', rhs: [';']}
};

const init = '<P>';

const select = {
	'<P>': {
		'begin': 1
	},
	'<Os>': {
		';': 2,
		'end': 3
	},
	'<O>': {
		';': 4
	}
};

const postproc = {
	1: (state, [,program,]) =>
	{
		return {type: 'program', program};
	},
	2: (state, [operator, operators]) =>
	{
		return [operator, ...(operators || [])];
	},
	3: () =>
	{
		return undefined;
	},
	4: () =>
	{
		return {type: 'empty operator'};
	},

	// 1: (state, [E]) =>
	// {
	// 	return {type: 'expression', root: E};
	// },
	// 2: (state, [,,E1,,E2]) =>
	// {
	// 	return {type: 'operation/add', mnemonics: 'ADD', commutative: true, lhs: E1, rhs: E2};
	// },
	// 3: (state, [,,E1,,E2]) =>
	// {
	// 	return {type: 'operation/sub', mnemonics: 'SUB', shiftable: true, lhs: E1, rhs: E2};
	// },
	// 4: (state, [,,E1,,E2]) =>
	// {
	// 	return {type: 'operation/mul', mnemonics: 'MUL', commutative: true, lhs: E1, rhs: E2};
	// },
	// 5: (state, [,,E1,,E2]) =>
	// {
	// 	return {type: 'operation/div', mnemonics: 'DIV', lhs: E1, rhs: E2};
	// },
	// 6: (state, [a]) =>
	// {
	// 	return {type: 'value/id', id: a.value};
	// },
	// 7: (state, [v]) =>
	// {
	// 	return {type: 'value/literal', value: v.value};
	// }
};


// const regs = ['eax']; // , 'ecx'
const regs = ['eax', 'ecx', 'edx', 'ebx', 'esi', 'edi'];




const program = `
	begin ;;;; end
`;

const printf = require('printf');

const lexan = require('./lexan');

const tokens = lexan(program);

tokens.forEach(
	({offset, type, value}) => console.log(
		printf('%20d %30s %20s', offset, type, value !== undefined ? value : '')
	)
);


const Syntan = require('./syntan');
const syntan = new Syntan(rules, init, select, postproc);

const state = {};


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

const asm = entry(state, parsed.result).out.join('\n');

const run = require('./assembler');

console.log(asm);
run(asm);




function entry(state, parsed)
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

		const rhs = expression(state, scope, pushLhs ? freeRegs : freeRegsForRhs, expr.rhs, usedRegs);
		out.push.apply(out, rhs.out);

		if (lhs.loc.type === 'r')
		{
			out.push(`        ${expr.mnemonics.padEnd(7)} ${lhs.loc.addr}, ${rhs.loc.addr}`);
			loc = lhs.loc;
		}
		else if (rhs.loc.type === 'r' && expr.commutative)
		{
			out.push(`        ${expr.mnemonics.padEnd(7)} ${rhs.loc.addr}, ${lhs.loc.addr}`);
			loc = rhs.loc;
		}
		else if (rhs.loc.type === 'r' && expr.shiftable)
		{
			out.push(`        ${expr.mnemonics.padEnd(7)} ${lhs.loc.addr}, ${rhs.loc.addr}`);
			loc = lhs.loc;
		}
		else if (rhs.loc.type === 'r')
		{
			out.push(`        PUSH    ${rhs.loc.addr}`);
			pushes++;

			if (pushLhs)
				lhs.loc = {type: 'm', addr: '[esp+2]'};

			out.push(`        MOV     ${rhs.loc.addr}, ${lhs.loc.addr}`);
			out.push(`        ${expr.mnemonics.padEnd(7)} ${rhs.loc.addr}, [esp+1]`);

			loc = rhs.loc;
		}
		else
		{
			const reg = _.first(pushLhs ? freeRegs : freeRegsForRhs);

			if (!reg)
				throw new Error('Register file overload');

			usedRegs[reg] = true;

			out.push(`        MOV     ${reg}, ${lhs.loc.addr}`);
			out.push(`        ${expr.mnemonics.padEnd(7)} ${reg}, ${_.isEqual(lhs.loc, rhs.loc) ? reg : rhs.loc.addr}`);
			loc = {type: 'r', addr: reg};
		}

		if (pushes)
			out.push(`        ADD     esp, ${pushes}`);

		return {out, loc};
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
