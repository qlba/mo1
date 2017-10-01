function tprintf(cells, typesetRatio)
{
	var width = 0, result = '';

	for(var i = 0; i < cells.length; i++)
		for(var j = 0; j < cells[i].length; j++)
			if(cells[i][j].length > width)
				width = cells[i][j].length;

	width += 1;

	for(i = 0; i < cells.length; i++)
	{
		for(j = 0; j < cells[i].length; j++)
			result += (' ').repeat(width - cells[i][j].length) + cells[i][j];

		result += ('\n').repeat((width + 1) / typesetRatio);
	}

	return result;
}

module.exports = {tprintf};
