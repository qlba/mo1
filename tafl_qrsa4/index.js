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
		return {type: 'value', loc: 'stack', id: a};
	}
};




const Syntan = require('./syntan');
const syntan = new Syntan(rules, init, select, postproc);

const state = {};


const parsed = syntan.parse(state, '+(+(a,a),+(a,a))');

if (!parsed.accept)
	process.exit(-1);

state.functions = {main: {varSize: 12}};

// console.dir(parsed.accept && parsed.result, {depth: null});
console.log(entry(state, {func: 'main'}, parsed.result).out.join('\n'));

// const pp = (...args) => {console.dir(args); return ' ' + args.join('') + ' ';};

// const codegen = {
// 	1: pp,
// 	2: pp,
// 	3: pp
// };

function entry(state, cgState, parsed)
{
	return {
		out: [
			`${cgState.func}:`,
			'        PUSH    ebp',
			'        MOV     ebp, esp',
			`        SUB     esp, ${state.functions[cgState.func].varSize}`,
			...expression(state, cgState, parsed.root).out,
			`        ADD     esp, ${state.functions[cgState.func].varSize}`,
			'        POP     ebp'
		]
	};
}


const optypes = {
	'MUL': [
		{dest: 'eax', lhs: 'eax', rhs: 'reg'},
		{dest: 'eax', lhs: 'eax', rhs: 'mem'},
		{}
	]
};

// used regs total
// used regs currently

function expression(state, cgState, expr)
{
	if (expr.type === 'op')
	{
		const lhs = expression(state, expr.lhs);
		const rhs = expression(state, expr.rhs);

		switch (lhs.loc)
		{
			case 
		}

		switch (lhs.loc) {
			
		}

		if ()

		return {
			out: [
				...lhs.out,
				...rhs.out,
				`        ${expr.op}`
			]
		};
	}
	else
	{
		expr.out = [];

		return expr;


		switch (expr.loc)
		{
			case 'stack':
				return 
		}

		if (cgState.) {

		}

		return {
			loc: {type: 'stack'},
			out: [`        PUSH    ${expr.value}`]
		};
	}
}
