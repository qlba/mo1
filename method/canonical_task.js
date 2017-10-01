var {IAryth} = require('../mx/iaryth'),
	{is} = require('../utils/is'),
	{N} = require('../utils/number_types');

class CanonicalTask
{
	constructor(varsCount, equationsCount, coefficients, freeMembers,
		targetFunctionCoefficients, targetFunctionFreeMember,
		varNames)
	{
		if(!varNames)
			varNames = new Array(varsCount).fill(0).map((_, i) => `x${i + 1}`);

		validateParams();

		Object.assign(this, {
			varsCount, equationsCount, coefficients, freeMembers,
			targetFunctionCoefficients, targetFunctionFreeMember,
			varNames
		});

		function validateParams()
		{
			if(!N(varsCount) || !N(equationsCount))
				throw new TypeError('varsCount and equationsCount must be N-numbers');
			
			if(coefficients.length !== equationsCount)
				throw new Error('coefficients must be equationsCount long');

			coefficients.forEach(coefficientRow =>
			{
				if(coefficientRow.length !== varsCount)
					throw new Error('coefficients elements must be varsCount long');

				coefficientRow.forEach(coefficient =>
				{
					if(!is(IAryth)(coefficient))
						throw new TypeError('All coefficients must be IAryth');
				});
			});

			if(freeMembers.length !== equationsCount)
				throw new Error('freeMembers must be equationsCount long');

			freeMembers.forEach(freeMember =>
			{
				if(!is(IAryth)(freeMember))
					throw new TypeError('All freeMembers must be IAryth');
			});

			if(targetFunctionCoefficients.length !== varsCount)
				throw new Error('targetFunctionCoefficients must be varsCount long');

			targetFunctionCoefficients.forEach(targetFunctionCoefficient =>
			{
				if(!is(IAryth)(targetFunctionCoefficient))
					throw new TypeError('All targetFunctionCoefficients must be IAryth');
			});

			if(!is(IAryth)(targetFunctionFreeMember))
				throw new TypeError('targetFunctionFreeMember must be IAryth');

			if(varNames.length !== varsCount)
				throw new Error('varNames must be varsCount long');

			varNames.forEach(varName =>
			{
				if(!is(String)(varName))
					throw new TypeError('All varNames must be String');
			});
		}
	}
}

module.exports = {CanonicalTask};
