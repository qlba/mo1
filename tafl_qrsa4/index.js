const yargs = require('yargs');

const printf = require('printf');
const fs = require('fs');

const assembler = require('./assembler');
const syntan = require('./syntan');
const lexan = require('./lexan');
const exec = require('./env');

(async () => {
	const argv = yargs
		.usage('$0 <source>', 'Interpret source', yargs => yargs
			.env('TAFL_QRSA4')
			.config()
			.positional('source', {
				describe: 'Source file path',
				type: 'string',
				demandOption: true
			})
			.option('bypass', {
				alias: 'b',
				group: 'Stage:',
				describe: 'Print source file',
				type: 'boolean',
				defaults: false
			})
			.option('lexan', {
				alias: 'e',
				group: 'Stage:',
				describe: 'Print lexical analyzer output',
				type: 'boolean',
				defaults: false
			})
			.option('syntan', {
				alias: 'c',
				group: 'Stage:',
				describe: 'Print syntax analyzer log and output',
				type: 'boolean',
				defaults: false
			})
			.option('assembler', {
				alias: 's',
				group: 'Stage:',
				describe: 'Print assembler output',
				type: 'boolean',
				defaults: false
			})
			.option('debug', {
				alias: 'g',
				group: 'Debug:',
				describe: 'Enable debugging',
				type: 'boolean',
				defaults: false
			})
			.example('tafl_qrsa4 --bypass main.lang', 'Print contents of main.lang')
			.example('tafl_qrsa4 --lexan main.lang', 'Print lexical analyzer output for main.lang')
			.example('tafl_qrsa4 --syntan main.lang', 'Print syntax analyzer output for main.lang')
			.example('tafl_qrsa4 --assembler main.lang', 'Print assembler output for main.lang')
			.example('tafl_qrsa4 --debug main.lang', 'Assemble and debug main.lang')
			.example('tafl_qrsa4 main.lang', 'Assemble and run main.lang')
			.epilogue('Report bugs to <qlba@deabeef-industries-gmbh.com>')
			.strict()
			, () => {})
		.detectLocale(false)
		.argv;

	// source = 'tafl_qrsa4/test/p1.lang';
	// stage = 'run';


	const program = fs.readFileSync(argv.source).toString();

	if (argv.bypass)
	{
		console.log(program);
		process.exit();
	}


	const tokens = lexan(program);

	if (argv.lexan)
	{
		tokens.forEach(({offset, type, value}) => console.log(
			printf('%20d %30s %20s', offset, type, value !== undefined ? value : '')
		));

		process.exit();
	}


	const stucture = syntan({}, tokens, argv.syntan);

	if (argv.syntan)
	{
		console.dir(stucture, {depth: null});
		process.exit();
	}


	const assembly = assembler({}, stucture.result).out.join('\n');

	if (argv.assembler)
	{
		console.log(assembly.toLowerCase());
		process.exit();
	}


	await exec(assembly, argv.debug);

})().catch(e => console.log(e.message)).then(code => process.exit(code || 0));
