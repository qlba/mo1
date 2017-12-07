module.exports = function(source)
{
	let offset = 0, done = false;

	const lexems = [];

	const types = {
		whitespace: {
			regex: /^[ \t\n]/,
			proc: () => {}
		},
		keyword: {
			regex: /^(var|begin|end|read|write|repeat|until)/,
			proc: match => lexems.push(lexem(offset, match))
		},
		identifier: {
			regex: /^[A-Za-z_][0-9A-Za-z_]*/,
			proc: match => lexems.push(lexem(offset, 'identifier', match))
		},
		float: {
			regex: /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/,
			proc: match => lexems.push(lexem(offset, 'float', parseFloat(match)))
		},
		comment: {
			regex: /^(\/\*(.|\n)*?\*\/|\/\/.*?(\n|$))/,
			proc: () => {}
		},
		aryth: {
			regex: /^[+-/*]/,
			proc: match => lexems.push(lexem(offset, match))
		},
		relation: {
			regex: /^(==|!=|<=?|>=?)/,
			proc: match => lexems.push(lexem(offset, 'relation_operation', match))
		},
		assignment: {
			regex: /^=/,
			proc: () => lexems.push(lexem(offset, '='))
		},
		specials: {
			regex: /^[(),;]/,
			proc: match => lexems.push(lexem(offset, match))
		},
		endOfFile: {
			regex: /^$/,
			proc: match => {lexems.push(lexem(offset, '$')); done = true;}
		}
	};

	while (!done)
	{
		let matched = false;

		for (let type in types)
		{
			const match = types[type].regex.exec(source);

			if (match)
			{
				types[type].proc(matched = match[0]);
				break;
			}
		}

		if (matched === false)
			throw new Error(`Unknown lexem at ${offset}`);

		source = source.slice(matched.length);
		offset += matched.length;
	}

	return lexems;
};

function lexem(offset, type, value)
{
	return {offset, type, value};
}
