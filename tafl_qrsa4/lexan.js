const types = {
	whitespace: {
		regex: /[ \t\n]/g,
		lexem: () => lexem()
	},
	keyword: {
		regex: /(var|begin|end|read|write|repeat|until)/g,
		lexem: match => lexem(match)
	},
	identifier: {
		regex: /[A-Za-z_][0-9A-Za-z_]*/g,
		lexem: match => lexem('identifier', match)
	},
	number: {
		regex: /[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/g,
		lexem: match => lexem('number', parseFloat(match))
	},
	comment: {
		regex: /(\/\*(.|\n)*?\*\/|\/\/.*?(\n|$))/g,
		lexem: () => lexem()
	},
	aryth: {
		regex: /[+-/*]/g,
		lexem: match => lexem(match)
	},
	relation: {
		regex: /(==|!=|<=?|>=?)/g,
		lexem: match => lexem('relation_operation', match)
	},
	assignment: {
		regex: /=/g,
		lexem: () => lexem('=')
	},
	specials: {
		regex: /[(),;]/g,
		lexem: match => lexem(match)
	},
	endOfFile: {
		regex: /$/g,
		lexem: () => lexem('$')
	}
};

module.exports = function(source)
{
	const lexems = [];
	let offset = 0;

	while (offset < source.length)
	{
		let matched = false;

		for (let type in types)
		{
			types[type].regex.lastIndex = offset;

			const match = types[type].regex.exec(source);

			if (match && match.index === offset)
			{
				const {type, value} = types[type].lexem(matched = match[0]);

				if (lexem.type)
					lexems.push({offset, type, value});

				break;
			}
		}

		if (matched === false)
			throw new Error(`Unknown lexem at ${offset}`);

		offset += matched.length;
	}

	return lexems;
};

function lexem(type, value)
{
	return {type, value};
}
