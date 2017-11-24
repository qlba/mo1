const sprintf = require('printf');

module.exports.log = (fmt, ...args) => {
	process.stdout.write(sprintf(fmt, ...args));
};
