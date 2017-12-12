const _ = require('lodash');

//function findFirst(grammar)
//{
	//const chars = _(grammar).map(({lhs, rhs}) => [lhs, ...rhs]).flatten().sort().uniq().value();
	//const [nts, ts] = _.partition(chars, nt);
//
	//const first = {};
//
	//_(ts).each(t => first[t] = t);
//
	//do {
		//
	//} while ();
//
	//_(nts).each(nt =>
	//{
		//first[]
	//});
//
	//for (let c in chars) {
		//c = chars[c];
		////if (lhs.rule === '')
		//console.log(`${c}  ${nt(c) ? '+' : ''}`);
	//}
//
	//console.log(chars);
//}
//
function main(grammar)
{
	//findFirst(grammar);

	const chars = _(grammar).map(({lhs, rhs}) => [lhs, ...rhs]).flatten().sort().uniq().value();

	_(chars).each(c =>
		console.log(`${c}  ${isnullable(c)}`));
}

const grammar = [
	{lhs: 'E', rhs: ['E', '+', 'T']},
	{lhs: 'E', rhs: ['E', '-', 'T']},
	{lhs: 'E', rhs: ['T']},
	{lhs: 'T', rhs: ['T', '*', 'P']},
	{lhs: 'T', rhs: ['T', '/', 'P']},
	{lhs: 'T', rhs: ['P']},
	{lhs: 'P', rhs: ['(', 'E', ')']},
	{lhs: 'P', rhs: ['-', '(', 'E', ')']},
	{lhs: 'P', rhs: ['a']}
];

const init = _.first(grammar).lhs;


const nt = (c) => _(grammar).some({lhs: c});


function isnullable(c)
{
	const defs = _(grammar).filter({lhs: c}).map('rhs').value();

	for (let def in defs)
	{
		let nullable = false;

		def = defs[def];

		for (let c in def)
		{
			c = def[c];

			if (isnullable(c)) {
				nullable = true;
				break;
			}
		}

		if (nullable)
			return true;
	}

	return false;
}

//
//function firsts(c, grammar)
//{
	//// Get all rules
	//const defs = _(grammar).filter({lhs: c}).map('rhs').value();
//
	//if (_(defs).isEmpty()) // Terminal
		//return [c];
	//else
	//{
		//let res = [];
//
		//for (let def in defs)
		//{
			//if (_(def).isEmpty())
				//res = _.union(res, [null]);
			//else {
				//let first = firsts(_.first(def));
//
				//
			//}
			//
		//}
//
	//}
//
//
	//if (nt(_.first(seq)))
		//return _first(seq);
	//else if ()
//}

main(grammar);
