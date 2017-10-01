function toBasicView(splx, cols)
{
	var {m, n} = splx;

	cols.forEach(function(j)
	{
		if(!splx.validElement(0, j))
			throw new RangeError(`No such column: [${j}] in ${n}`);
	});

	var basics = {};

	cols.forEach(function(j)
	{
		var i;

		for(i = 0; i < m - 1; i++)
			if(basics[i] === undefined && !splx.getElement(i, j).isZero())
			{
				basics[i] = j;

				splx.makeBasic(i, j);

				break;
			}

		if(i === m - 1)
			throw new Error('Impossible to make specified columns basic ' +
				'simultaneously. These columns are linealy dependendent.'
			);
	});

	return basics;
}

module.exports = {toBasicView};
