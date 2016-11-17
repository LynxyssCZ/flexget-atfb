'use strict';
require('dotenv').load();

const Async = require('async');
const path = require('path');
const bunyan = require('bunyan');

const ATFB = require('./src');
const log = bunyan.createLogger({name: 'ATFB', level: process.env.LOG_LEVEL});

const app = new ATFB({
	logger: log,
	database: {
		client: 'sqlite3',
		connection: {
			filename: path.join(__dirname, 'const', 'atfb.sqlite')
		},
		useNullAsDefault: false
	},
	reader: {
		clientId: process.env.CLIENT_ID,
		apiKey: process.env.API_KEY
	},
	flexget: {
		filename: path.join(__dirname, 'const',  'series.yml'),
		command: '~/flexget/bin/flexget daemon reload'
	}
});

let refreshInterval;

const clear = function() {
	app.stop(function() {
		clearInterval(refreshInterval);
		refreshInterval = null;
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
			refresh();
			refreshInterval = setInterval(refresh, process.env.UPDATE_PERIOD);
		}
	});
};

function refresh() {
	app.methods.reader.getUserList(process.env.ANI_USER, ['watching', 'plan_to_watch'])
		.then((list) => {
			log.info(list.length);
			Async.map(list, processAnime, (err, seriesList) => {
				if (!err) {
					app.methods.flexget.updateConfig(seriesList, (err) => {
						if (err) {
							throw err;
						}
					});
				}
				else {
					throw err;
				}
			});
		})
		.catch((err) => {
			log.error(err);
			clear();
		});
}

function processAnime(anime, next) {
	const animeData = app.methods.seriesNameGenerator.generateNames(anime);

	app.methods.registry.storeAnime(animeData, (error, animeRecord) => {
		if (error) {
			next(error);
		}
		else {
			next(null, animeRecord);
		}
	});
}

process.on('SIGINT', clear);
process.on('uncaughtException', function (err) {
	log.error('Some unexpected error occured', err);
	clear();
});

start();
