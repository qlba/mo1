function is(type)
{
	if(typeof(type) === 'string')
		return function(value)
		{
			return typeof(value) === type;
		};
	else if(typeof(type) === 'function')
		return function(value)
		{
			return value instanceof type || value.constructor && value.constructor === type;
		};
	else if(type === null || type === undefined)
		return function(value)
		{
			return value === type;
		};
	else
		throw new TypeError('Unsupported type of type');
}

module.exports = {is};
