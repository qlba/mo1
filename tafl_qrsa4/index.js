const yargs = require('yargs');

const printf = require('printf');
const fs = require('fs');

const assembler = require('./assembler');
const syntan = require('./syntan');
const lexan = require('./lexan');
const exec = require('./env');

(async () => {
	const {source, mode} = yargs
		.command('$0 <source>', 'interpret <source>')
		.option('mode', {
			alias: 'm',
			group: 'mode',
			type: 'string',
			choices: ['cat', 'lexan', 'syntan', 'assembly', 'debug', 'run'],
			defaults: 'run'
		})
		.argv;


	const program = fs.readFileSync(source).toString();

	if (mode === 'cat')
	{
		console.log(program);
		process.exit();
	}


	const tokens = lexan(program);

	if (mode === 'lexan')
	{
		tokens.forEach(({offset, type, value}) => console.log(
			printf('%20d %30s %20s', offset, type, value !== undefined ? value : '')
		));

		process.exit();
	}


	const stucture = syntan({}, tokens, mode === 'syntan');

	if (mode === 'syntan')
	{
		console.dir(stucture, {depth: null});
		process.exit();
	}


	const assembly = assembler({}, stucture.result).out.join('\n');

	if (mode === 'assembly')
	{
		console.log(assembly);
		process.exit();
	}


	await exec(assembly, mode === 'debug');

})().catch(e => console.log(e.message)).then(code => process.exit(code || 0));
