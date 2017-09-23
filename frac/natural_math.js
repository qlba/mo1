var {N} = require('../utils/number_types');

function GCD(a, b)
{
	if(!N(a) || !N(b))
		throw new TypeError('GCD accepts only natural numbers');

	if(a < b)
	{
		var x = a;
		a = b;
		b = x;
	}

	var r;

	while((r = a % b) !== 0)
	{
		a = b;
		b = r;
	}

	if(!N(b))
		throw new Error('Unknown GCD failure: non-natural result');

	return b;
}


function LCM(a, b)
{
	if(!N(a) || !N(b))
		throw new TypeError('LCM accepts only natural numbers');

	var lcm = Number.isSafeInteger(a * b) ?
		LCM_fast(a, b) :
		LCM_safe(a, b);

	if(!N(lcm))
		throw new Error('LCM failure: arguments too large: ' + lcm);

	if(Number.isSafeInteger(a * b) && LCM_fast(a, b) !== LCM_safe(a, b))
		throw new Error(`[Debug] LCM failure: safe (${LCM_safe(a, b)}) !== fast (${LCM_fast(a, b)})`);

	return lcm;
}

function LCM_fast(a, b)
{
	return a * b / GCD(a, b);
}

function LCM_safe(a, b)
{
	var prodA = disassemble(a),
		prodB = disassemble(b);

	var i;

	for(i in prodA)
		if(prodB[i] !== undefined)
		{
			if(prodA[i] < prodB[i])
				prodB[i] -= prodA[i];
			else
				prodA[i] -= prodB[i];
		}
	
	var lcm = 1;

	for(i in prodA)
		lcm *= Math.pow(i, prodA[i]);

	for(i in prodB)
		lcm *= Math.pow(i, prodB[i]);

	return lcm;
}

function disassemble(x)
{
	var result = {};

	for(var i = 2; i * i <= x;)
		if(x % i === 0)
		{
			result[i] = (result[i] || 0) + 1;
			x /= i;
		}
		else
			i++;
	
	if(x !== 1)
		result[x] = (result[x] || 0) + 1;

	return result;
}


module.exports = {GCD, LCM};
