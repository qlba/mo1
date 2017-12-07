const KEYWORDS = ['if', 'else', 'while', 'do', 'for'];

module.exports = function(program)
{
	const intape = program + '$';
	const lexems = [];

	let ptr = 0;
	let lexptr = 0;
	let s = 0;

	for (;;)
	{
		const x = intape[ptr];

		switch (s)
		{
		case 0:
			lexptr = ptr;

			if (x === '$') {
				lexems.push(lexem(lexptr, '$'));
				return lexems;
			}
			else if (isblank(x))
				ptr++;
			else if (isalpha(x)) {
				s = 1;
				ptr++;
			}
			else if (isdigit(x)) {
				s = 2;
				ptr++;
			}
			else
				throw new Error(`Invalid character ${x} for state ${s}`);

			break;
		case 1:
			if (isalnum(x))
				ptr++;
			else {
				const id = intape.slice(lexptr, ptr);
				lexems.push(KEYWORDS.indexOf(id) > -1 ? lexem(lexptr, id) : lexem(lexptr, 'a', id));
				s = 0;
			}
			break;
		default:
			throw new Error(`Invalid lexan state: ${s}`);
		}
	}

	function parseNumber()
	{
		let s = 0;

		for (;;)
		{
			const x = intape[ptr];
	
			switch (s)
			{
			case 0:
				if (isdigit(x))
					ptr++;
				else if (x === '.') {
					s = 3;
					ptr++;
				}
				else {
					lexems.push(lexem(lexptr, '1', parseFloat(intape.slice(lexptr, ptr))));
					s = 0;
				}
				break;
			case 1:
				if (isdigit(x))
					ptr++;
				else {
					lexems.push(lexem(lexptr, '1', parseFloat(intape.slice(lexptr, ptr))));
					s = 0;
				}
				break;
			default:
				throw new Error(`Invalid lexan state: ${s}`);
			}
		}
	}

};

function lexem(ptr, type, value)
{
	return {offset: ptr, type, value};
}

function isalpha(c)
{
	return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z');
}

function isdigit(c)
{
	return c >= '0' && c <= '9';
}

function isalnum(c)
{
	return isalpha(c) || isdigit(c);
}

function isblank(c)
{
	return c === ' ' || c === '\t' || c === '\n';
}


console.dir(module.exports('ASDb\t\twhile\n'));
