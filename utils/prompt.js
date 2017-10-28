const {createInterface} = require('readline');

const interface = createInterface(process.stdin, process.stdout);

module.exports = prompt => new Promise(resolve =>
	interface.question(prompt, resolve)
);
