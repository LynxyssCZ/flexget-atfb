'use strict';
const Async = require('async');
const RinCore = require('rin-core');

class ATFB extends RinCore {
	constructor(options) {
		super({
			logger: options.logger
		});

		this.options = options;
	}

	init(next) {
		Async.series([
			this.registerInternals.bind(this),	// Register internals
			this.registerPlugins.bind(this)		// Plugins first, they register flux stores and db tables
		], next);
	}

	start(next) {
		this.logger.info('Starting');
		this.logger.debug({
			pluginTree: this.getPluginTree()
		}, 'Extension data');

		return super.start(next);
	}

	stop(next) {
		this.logger.info('Stoping.');

		return super.stop(next);
	}

	registerInternals(next) {
		super.register([{
			class: require('rin-core/plugins/Bookshelf'),
			options: this.options.database
		}], next);
	}

	registerPlugins(next) {
		super.register([{
			name: 'registry',
			class: require('./registry')
		}, {
			name: 'reader',
			class: require('./Reader'),
			options: this.options.reader
		}, {
			name: 'parser',
			class: require('./Parser')
		}], next);
	}
}

module.exports = ATFB;
