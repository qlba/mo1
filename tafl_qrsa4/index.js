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
	1: ([E]) =>
	{
		return {type: 'expr', root: E};
	},
	2: ([,,E1,,E2]) =>
	{
		return {type: 'op', op: 'add', lhs: E1, rhs: E2};
	},
	3: ([a]) =>
	{
		return {type: 'imm', imm: 'id', value: a};
	}
};




const Syntan = require('./syntan');

const syntan = new Syntan(rules, init, select, postproc);


const parsed = syntan.parse('+(+(a,a),+(a,a))');



console.dir(parsed.accept && parsed.result, {depth: null});

// const pp = (...args) => {console.dir(args); return ' ' + args.join('') + ' ';};

// const codegen = {
// 	1: pp,
// 	2: pp,
// 	3: pp
// };

function entry(parsed)
{
	// assert: parsed.type === expr
	return expr(parsed.root);
}

function expr(exprRoot)
{
	
}


function ulmanseti(exprRoot)
{



}

function markup(expr)
{
	if (expr.type === 'imm')
		return expr.mark = 1;

	if (expr.lhs.type === 'imm')
		expr.lhs.mark = 
}
