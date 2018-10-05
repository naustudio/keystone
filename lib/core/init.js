/**
 * Initialises Keystone with the provided options
 */

function init (options) {
	this.options(options);
	this.initMediaCollection(this);
	return this;
}

module.exports = init;
