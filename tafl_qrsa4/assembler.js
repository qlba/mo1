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
	return {out: [
		'        NOP',
		'        CALL    3',
		'        INT     0',
		...operators(parsed, {}, 3).out,
		'        MOV     eax, 0',
		'        RET'
	]};
};

function operators(parsed, oldScope, offset)
{
	const newVarsList = _.chain(parsed)
		.filter({type: 'variables_declaration'})
		.map('vars')
		.flatten()
		.value();

	const newVars = {};

	for (let i = 0; i < newVarsList.length; i++)
	{
		const newVar = newVarsList[i];

		if (newVars[newVar])
			throw new Error(`Ambiguous definition of variable ${newVar}`);

		newVars[newVar] = {
			loc: {
				type: 'm',
				addr: `[esp+${i + 1}]`
			}
		};
	}

	const scope = Object.assign({}, oldScope, newVars);
	// const usedRegs = {};

	const results = parsed.map(operator =>
	{
		const {identifier} = operator;

		let out, expr;

		switch (operator.type)
		{
		case 'read':
			if (!scope[identifier])
				throw new Error(`Undefined reference to ${identifier}`);

			if (!scope[identifier].loc.type === 'imm')
				throw new Error(`Cannot read into immediate value ${identifier}`);

			out = [
				...print(`${identifier}: `),
				'        INT     1',
				`        MOV     ${scope[identifier].loc.addr}, eax`
			];
			break;
		case 'write':
			if (!scope[identifier])
				throw new Error(`Undefined reference to ${identifier}`);

			out = [
				...print(`${identifier} = `),
				`        MOV     eax, ${scope[identifier].loc.addr}`,
				'        INT     3'
			];
			break;
		case 'assignment':
			operator.vars.forEach(id =>
			{
				if (!scope[id])
					throw new Error(`Undefined reference to ${id}`);
			});

			expr = expression(scope, regs, operator.expression, {});

			out = [...expr.out];

			if (expr.loc.type === 'm')
			{
				out.push(`        MOV     eax, ${expr.loc.addr}`);
				expr.loc = {type: 'r', addr: 'eax'};
			}

			operator.vars.forEach(id =>
			{
				out.push(`        MOV     ${scope[id].loc.addr}, ${expr.loc.addr}`);
			});

			break;
		case 'repeat':
			if (!scope[identifier])
				throw new Error(`Undefined reference to ${identifier}`);

			const body = operators(operator.operators, scope, offset + 1);

			expr = expression(scope, regs, operator.expression, {});

			out = [...body.out, ...expr.out];

			const varReg = expr.loc.addr === 'eax' ? 'ebx' : 'eax';
			const relop = ({
				'<': 'JGE',
				'>': 'JLE',
				'==': 'JNE',
				'<=': 'JG',
				'>=': 'JL',
				'!=': 'JE',
			})[operator.relation_operator];

			out.push(`        MOV     ${varReg}, ${scope[identifier].loc.addr}`);
			out.push(`        CMP     ${varReg}, ${expr.loc.addr}`);
			out.push(`        ${relop.padEnd(7)} ${offset + 1}`);
			break;
		case 'variables_declaration':
			return [];
		default:
			throw new Error();
		}

		offset += out.length;

		return out;
	});

	return {out:
		newVarsList.length ? [
			`        SUB     esp, ${newVarsList.length}`,
			..._.flatten(results),
			`        ADD     esp, ${newVarsList.length}`
		] : _.flatten(results)
	};
}

// { accept: true,
// 	result:
// 	 [ { type: 'variables_declaration', vars: [ 'min', 'x' ] },
// 	   { type: 'read', identifier: 'min' },
// 	   { type: 'assignment',
// 		 vars: [ 'x' ],
// 		 expression: { type: 'value/number', value: 1 } },
// 	   { type: 'repeat',
// 		 operators:
// 		  [ { type: 'assignment',
// 			  vars: [ 'x' ],
// 			  expression:
// 			   { type: 'operation/binary/mul',
// 				 lhs: { type: 'value/identifier', id: 'x' },
// 				 rhs: { type: 'value/number', value: 2 } } } ],
// 		 identifier: 'min',
// 		 relation_operator: '<=',
// 		 expression: { type: 'value/identifier', id: 'x' } },
// 	   { type: 'write', identifier: 'x' } ] }
//   { out: [], loc: { type: 'imm', addr: 1 } }


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

	const expr = expression(scope, regs, body.root, usedRegs);

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

function expression(scope, freeRegs, expr, usedRegs)
{
	console.dir(expr);

	const type = expr.type.split('/');
	const out = [];
	let loc, pushes = 0;

	if (type[0] === 'operation')
	{
		const op = operations[type[2]];

		if (type[1] === 'binary')
		{
			const lhs = expression(scope, freeRegs, expr.lhs, usedRegs);
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

			const rhs = expression(scope, pushLhs ? freeRegs : freeRegsForRhs, expr.rhs, usedRegs);
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
		if (type[1] === 'identifier')
		{
			if (!scope[expr.id])
				throw new Error(`Undefined reference to ${expr.id}`);

			return {
				out: [],
				loc: scope[expr.id].loc
			};
		}
		else if (type[1] === 'number')
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


function print(str)
{
	return [
		`        SUB     esp, ${str.length + 1}`,
		..._.map(`${str}\0`, (c, i) => `        MOV     [esp+${i + 1}], ${c.charCodeAt(0)}`),
		'        INT     2'
	];
}
