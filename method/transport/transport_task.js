var {IAryth} = require('../../mx/iaryth'),
	{Mx} = require('../../mx/abstract_mx'),
	{is} = require('../../utils/is');

class TransportTask
{
	constructor(as, bs, cs)
	{
		if(!is(Array)(as) || !is(Array)(bs) || !is(Array)(cs))
			throw new TypeError('As, Bs and Cs must be arrays');

		var n = as.length,
			m = bs.length,
			i, j;

		for(i = 0; i < n; i++)
			if(!is(IAryth)(as[i]))
				throw new TypeError('Elements of As must be IAryth');

		for(j = 0; j < m; j++)
			if(!is(IAryth)(bs[j]))
				throw new TypeError('Elements of Bs must be IAryth');

		if(cs.length !== n)
			throw new RangeError('Cs must have n elements');

		for(i = 0; i < n; i++)
		{
			if(cs[i].length !== m)
				throw new RangeError('Elements of Cs must have m elements');

			for(j = 0; j < m; j++)
				if(!is(IAryth)(cs[i][j]))
					throw new TypeError('Elements of Cs must be IAryth');
		}

		Object.assign(this, {
			as: mxFromTable([as]),
			bs: mxFromTable([bs]),
			cs: mxFromTable(cs),
			n, m
		});
	}

	getViciousCycle(i, j)
	{
		
	}
}

function mxFromTable(table)
{
	var result = new Mx(table.length, table[0].length),
		i, j;

	var {n, m} = result;

	for(i = 0; i < n; i++)
	{
		if(table[i].length !== m)
			throw new RangeError('Elements must have equal number of elements');

		for(j = 0; j < m; j++)
			result.setElement(i, j, table[i][j]);
	}

	return result;
}

module.exports = {TransportTask};
