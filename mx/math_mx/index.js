var {JordanMx} = require('../jordan_mx');

class MathMx extends JordanMx
{
	add(rhs)
	{
		var A = this, B = rhs,
			{m, n} = this;

		if(A.m !== B.m || A.n !== B.n)
			throw new Error('Addition of matrices of different size');

		var result = new MathMx(m, n);

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
				result.setElement(i, j,
					A.getElement(i, j).add(B.getElement(i, j))
				);

		return result;
	}

	mul(rhs)
	{
		var A = this, B = rhs,	
			{m, n: p} = A,
			{n} = B;

		if(A.n !== B.m)
			throw new Error('Multiplication of matrices of incomplementary size');

		var result = new MathMx(m, n);

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
			{
				var sum = A.getElement(i, 0).mul(B.getElement(0, j));

				for(var k = 1; k < p; k++)
					sum = sum.add(A.getElement(i, k).mul(B.getElement(k, j)));

				result.setElement(i, j, sum);
			}

		return result;
	}

	invert()
	{
		var A = this,	
			{m, n} = A,
			Basetype = A.getElement(0, 0);

		if(m !== n)
			throw new Error('Cannot invert non-square matrix');

		var mx = new MathMx(m, 2 * n);

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
			{
				mx.setElement(i, j, A.getElement(i, j));
				mx.setElement(i, j + n, i === j ? Basetype.getOne() : Basetype.getZero());
			}

		for(var j = 0; j < n; j++)
		{
			var nnzc;

			for(nnzc = j; nnzc < m; nnzc++)
				if(!mx.getElement(nnzc, j).isZero())
					break;

			if(nnzc === m)
				throw new Error('Matrix rows are linearly dependent');

			mx.swapRows(j, nnzc);
			mx.makeBasic(j, j);
		}

		var result = new MathMx(m, n);

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
				result.setElement(i, j, mx.getElement(i, j + n));

		return result;
	}

	transpose()
	{
		var A = this,	
			{m, n} = A;

		var result = new MathMx(n, m);

		for(var i = 0; i < m; i++)
			for(var j = 0; j < n; j++)
				result.setElement(j, i, A.getElement(i, j));

		return result;
	}
}

module.exports = {MathMx};
