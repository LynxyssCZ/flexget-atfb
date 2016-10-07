'use strict';
require('dotenv').load();

const Async = require('async');
const bunyan = require('bunyan');

const ATFB = require('./src');

const log = bunyan.createLogger({name: 'ATFB', level: process.env.LOG_LEVEL});

const app = new ATFB({
	logger: log,
	database: require('./knexfile.js'),
	reader: {
		clientId: process.env.CLIENT_ID,
		apiKey: process.env.API_KEY
	}
});

const clear = function() {
	app.stop(function() {
		log.info('All Stopped');
		log.info('The way is clear, exiting.');
		process.exit();
	});
};

const start = function() {
	Async.series([
		app.init.bind(app),
		app.start.bind(app)
	], function(error) {
		if (error) {
			log.error(error);
			clear();
		}
		else {
			log.info('All Started');
			log.debug(app.getPluginTree());

			app.methods.reader.getAnimeData('20992')
				.then((data) => {
					log.info('anime data', app.methods.parser.parseAnimeData(data));
				})
				.catch((err) => {
					log.error(err);
				});

			app.methods.reader.getUserList(process.env.USER, ['watching', 'plan_to_watch'])
				.then((list) => {
					// log.info('List returned', app.methods.parser.parseUserList(list));
				})
				.catch((err) => {
					log.error(err);
				});
		}
	});
};

process.on('SIGINT', clear);
process.on('uncaughtException', function (err) {
	log.error('Some unexpected error occured', err);
	log.error(err.stack);
	clear();
});

start();
