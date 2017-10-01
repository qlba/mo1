var sprintf = require('printf');

function printf(...args)
{
	process.stdout.write(sprintf.apply(null, args));
}


module.exports = {printf, sprintf};
