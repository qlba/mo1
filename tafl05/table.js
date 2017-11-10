const _ = require('lodash');

module.exports = function(table)
{
	return _(table).omit('col').mapValues(
		row => _(table.col).zipObject(row).omitBy(_.isUndefined).value()
	).value();
};
