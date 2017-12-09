const chalk = require('chalk');
const {log} = require('./utils');
const Shop = require('./shop');
const Tape = require('./tape');

const rules = {
	1: {lhs: '<program>', rhs: ['begin', '<operators>', 'end']},

	2: {lhs: '<operators>', rhs: ['<operator>', '<rest_operators>']},
	3: {lhs: '<rest_operators>', rhs: ['<operator>', '<rest_operators>']},
	4: {lhs: '<rest_operators>', rhs: []},

	5: {lhs: '<operator>', rhs: ['var', '<vars>', ';']},
	6: {lhs: '<operator>', rhs: ['read', 'identifier', ';']},
	7: {lhs: '<operator>', rhs: ['write', 'identifier', ';']},
	8: {lhs: '<operator>', rhs: ['<vars>', '=', '<expression>', ';']},
	9: {lhs: '<operator>', rhs: ['repeat', '<operators>', 'until', '<relation>', ';']},

	10: {lhs: '<vars>', rhs: ['identifier', '<rest_vars>']},
	11: {lhs: '<rest_vars>', rhs: [',', 'identifier', '<rest_vars>']},
	12: {lhs: '<rest_vars>', rhs: []},

	13: {lhs: '<expression>', rhs: ['<term>', '<rest_expression>']},
	14: {lhs: '<rest_expression>', rhs: ['+', '<term>', '<rest_expression>']},
	15: {lhs: '<rest_expression>', rhs: ['-', '<term>', '<rest_expression>']},
	16: {lhs: '<rest_expression>', rhs: []},

	17: {lhs: '<term>', rhs: ['<multiplier>', '<rest_term>']},
	18: {lhs: '<rest_term>', rhs: ['*', '<multiplier>', '<rest_term>']},
	19: {lhs: '<rest_term>', rhs: ['/', '<multiplier>', '<rest_term>']},
	20: {lhs: '<rest_term>', rhs: []},

	21: {lhs: '<multiplier>', rhs: ['identifier']},
	22: {lhs: '<multiplier>', rhs: ['number']},
	23: {lhs: '<multiplier>', rhs: ['(', '<expression>', ')']},
	24: {lhs: '<multiplier>', rhs: ['-', '(', '<expression>', ')']},

	25: {lhs: '<relation>', rhs: ['identifier', 'relation_operation', '<expression>']}
};

const init = '<program>';

const select = {
	'<program>': {
		'begin': 1
	},
	'<operators>': {
		'var': 2,
		'read': 2,
		'write': 2,
		'identifier': 2,
		'repeat': 2
	},
	'<rest_operators>': {
		'var': 3,
		'read': 3,
		'write': 3,
		'identifier': 3,
		'repeat': 3,
		'end': 4,
		'until': 4
	},
	'<operator>': {
		'var': 5,
		'read': 6,
		'write': 7,
		'identifier': 8,
		'repeat': 9
	},
	'<vars>': {
		'identifier': 10,
	},
	'<rest_vars>': {
		',': 11,
		';': 12,
		'=': 12
	},
	'<expression>': {
		'identifier': 13,
		'number': 13,
		'(': 13,
		'-': 13
	},
	'<rest_expression>': {
		'+': 14,
		'-': 15,
		')': 16,
		';': 16
	},
	'<term>': {
		'identifier': 17,
		'number': 17,
		'(': 17,
		'-': 17
	},
	'<rest_term>': {
		'*': 18,
		'/': 19,
		'+': 20,
		'-': 20,
		')': 20,
		';': 20
	},
	'<multiplier>': {
		'identifier': 21,
		'number': 22,
		'(': 23,
		'-': 24
	},
	'<relation>': {
		'identifier': 25
	}
};

const postproc = {
	1: (state, [, operators]) =>
	{
		return operators;
	},
	2: (state, [operator, rest_operators]) =>
	{
		return [operator, ...rest_operators];
	},
	3: (state, [operator, rest_operators]) =>
	{
		return [operator, ...rest_operators];
	},
	4: () =>
	{
		return [];
	},
	5: (state, [, vars]) =>
	{
		return {type: 'variables_declaration', vars: vars.map(v => v.value)};
	},
	6: (state, [, identifier]) =>
	{
		return {type: 'read', identifier: identifier.value};
	},
	7: (state, [, identifier]) =>
	{
		return {type: 'write', identifier: identifier.value};
	},
	8: (state, [vars, , expression]) =>
	{
		return {type: 'assignment', vars: vars.map(v => v.value), expression};
	},
	9: (state, [, operators, , {identifier, relation_operator, expression}]) =>
	{
		return {type: 'repeat', operators, identifier, relation_operator, expression};
	},
	10: (state, [identifier, rest_vars]) =>
	{
		return [identifier, ...rest_vars];
	},
	11: (state, [, identifier, rest_vars]) =>
	{
		return [identifier, ...rest_vars];
	},
	12: () =>
	{
		return [];
	},
	13: (state, [term, rest_expression]) =>
	{
		if (rest_expression)
			return {
				type: `operation/binary/${rest_expression.op}`,
				lhs: term,
				rhs: rest_expression.expression
			};
		else
			return term;
	},
	14: (state, [, expression]) =>
	{
		return {op: 'add', expression};
	},
	15: (state, [, expression]) =>
	{
		return {op: 'sub', expression};
	},
	16: () =>
	{
		return null;
	},
	17: (state, [multiplier, rest_term]) =>
	{
		if (rest_term)
			return {
				type: `operation/binary/${rest_term.op}`,
				lhs: multiplier,
				rhs: rest_term.term
			};
		else
			return multiplier;
	},
	18: (state, [, term]) =>
	{
		return {op: 'mul', term};
	},
	19: (state, [, term]) =>
	{
		return {op: 'div', term};
	},
	20: () =>
	{
		return null;
	},
	21: (state, [identifier]) =>
	{
		return {type: 'value/identifier', id: identifier.value};
	},
	22: (state, [number]) =>
	{
		return {type: 'value/number', value: number.value};
	},
	23: (state, [, expression]) =>
	{
		return expression;
	},
	24: (state, [, , expression]) =>
	{
		return {
			type: 'operation/unary/neg',
			hs: expression
		};
	},
	25: (state, [identifier, relation_operator, expression]) =>
	{
		return {identifier: identifier.value, relation_operator: relation_operator.value, expression};
	}
};

module.exports = function(state, input, verbose)
{
	const shop = new Shop('$', init);
	const tape = new Tape(input);
	
	const ppshop = new Shop();

	let done = false, accept = false;

	for(let round = 0; !done; round++)
	{
		const M = shop.peek();
		const x = tape.get();

		const state = {};
		state.shop = shop.toString();
		state.tape = tape.toString();
		state.M = M;
		state.x = x;
	
		if (M === '$' && x.type === '$')
		{
			state.action = chalk.green('A');
			done = accept = true;
		}
		else if (typeof(M) === 'number')
		{
			state.action = chalk.cyan(`P  ${M}`);
	
			const rhs = rules[M].rhs, args = new Array(rhs.length);
	
			for (let i = rhs.length - 1; i >= 0; i--)
				args[i] = ppshop.pop();
	
			ppshop.push(postproc[M](state, args));
	
			shop.pop();
		}
		else if (select[M] && select[M][x.type])
		{
			state.action = chalk.yellow(`X  ${rules[select[M][x.type]].lhs} -> ${rules[select[M][x.type]].rhs}`);
	
			const rhs = rules[select[M][x.type]].rhs;
	
			shop.pop();
			shop.push(select[M][x.type]);
	
			for (let i = rhs.length - 1; i >= 0; i--)
				shop.push(rhs[i]);
		}
		else if (M === x.type)
		{
			tape.shift();
			shop.pop();
	
			ppshop.push(x);
	
			state.action = chalk.magenta(`M  ${x.type}`);
		}
		else
		{
			state.action = chalk.red('R');
			done = true;
		}
	
		verbose && log('%4d %25s %25s  %s  %s  %s\n', round, state.shop, state.tape.map(x => x.type).join(''), state.M, state.x.type, state.action);
	}

	if (!accept)
		throw new Error(`Syntax error at line ${tape.get().line} ` +
			`(position ${tape.get().offset}), ` +
			`expected ${shop.peek()}, got ${tape.get().type}`);
	
	return {
		accept,
		result: ppshop.pop()
	};
};
