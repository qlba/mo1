var {Mx} = require('./frac_mx/mx'),
	{Frac} = require('./frac_mx/frac'),
	{combinations} = require('./utils/combinatorics');

var mat = [
	[5,  5, -3,  1, -1,  4],
	[2,  1, -2,  3,  4, -1],
	[1,  5, -6,  3,  2,  4],
	// [4,  2, -4,  6,  8, -2],
	[0, -1, -1, -1, -1, -1]
];

// var mat = [
// 	[5, -3,  1, -1,  4, 5],
// 	[1, -2,  3,  4, -1, 2],
// 	[5, -6,  3,  2,  4, 1]
// ];

var mx = new Mx(mat.length, mat[0].length);

mx.fill(function(_, i, j)
{
	return new Frac(mat[i][j], 1);
});

// console.log(mx.toString());
// mx.makeBasic(0, 3-1);
// console.log(mx.toString());
// mx.makeBasic(1, 4-1);
// console.log(mx.toString());
// mx.makeBasic(2, 5-1);
// console.log(mx.toString());


combinations(3, 1, 5).forEach(function(combination)
{
	try
	{
		console.log(combination);

		mx.toBasicView(combination);

		var point = [];

		for(var j = 1; j <= 6; j++)
			if(combination.includes(j))
			{
				for(var i = 0; i < 3; i++)
					if(!mx.getElement(i, j).equal(mx.getElement(i, j).neg()))
						point.push(mx.getElement(i, 0));
			}
			else
				point.push(new Frac(0, 1));

		console.log('[' + point.join(', ') + ']: Z = ' +
			mx.getElement(3, 0).toString('%.2f')
		);
		
		for(var i = 0; i < 3; i++)
			if(mx.getElement(i, 0).less(mx.getElement(i, 0).neg()))
				console.log('NOT ACCEPTABLE');

		console.log(mx.toString());

	}
	catch(ex)
	{
		console.log('[' + combination.join(', ') + ']: failure: ' + ex.message);
	}
});
