const printf = require('printf');

const assembler = require('./assembler');
const syntan = require('./syntan');
const lexan = require('./lexan');
const exec = require('./env');

const program =
`
	begin
		var min, x;

		read min;

		x = 1;

		repeat
			x = x * 2;
		until
			min <= x;

		write x;
	end
`;


const tokens = lexan(program);

tokens.forEach(
	({offset, type, value}) => console.log(
		printf('%20d %30s %20s', offset, type, value !== undefined ? value : '')
	)
);


const state = {};
const stucture = syntan(state, tokens);

console.dir(stucture, {depth: null});

if (!stucture.accept)
	process.exit(-1);


const assembly = assembler(state, stucture.result).out.join('\n');
console.log(assembly);


exec(assembly);
