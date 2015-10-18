'use strict';
require('dotenv').load();
var Bluebird = require('bluebird');
var Yaml = require('yamljs');
var fs = Bluebird.promisifyAll(require('fs'));
var ATFB = require('./src');
var Shell = require('shelljs');

var usersString = process.env.USERS;
var shortNames = process.env.SHORT_NAMES.split(';');
var lastYaml;
var refreshInterval;

start();

function start() {
	refreshInterval = setInterval(refresh, process.env.UPDATE_PERIOD);
	refresh();
	Shell.exec('flexget daemon start -d');
}

function stop() {
	clearInterval(refreshInterval);
	refreshInterval = null;
	Shell.exec('flexget daemon stop');
	process.exit();
}
process.on('SIGINT', stop);

function refresh() {
	Bluebird.map(usersString.split(';'), readList)
	.reduce(normalizeList, Object.create(null))
	.then(generateYaml)
	.then(function(yaml) {
		if (yaml !== lastYaml) {
			lastYaml = yaml;
			return updateConfig(yaml);
		}
	})
	.then(function() {
		Shell.exec('flexget daemon reload');
	});
}

function updateConfig(newYaml) {
	return fs.writeFileAsync(process.env.SERIES_FILE, newYaml);
}

function normalizeList(items, list) {
	list.forEach(function(item) {
		var normalizedName = normalizeName(item.title);
		var shortName = item.title.split(':')[0];
		var normalizedNames = normalizeNames(item);

		if (item.title !== normalizedName) {
			normalizedNames.push(item.title);
		}

		if (shortNames.indexOf(shortName) >= 0) {
			normalizedNames.push(shortName);
		}

		items[normalizedName] = normalizedNames;
	});
	return items;
}

function normalizeNames(item) {
	var normalizedNames = [];

	if (item.title !== item.alternateTitle) {
		normalizedNames.push(item.alternateTitle);

		if (item.alternateTitle.indexOf(': ') >= 0) {
			normalizedNames.push(normalizeName(item.alternateTitle));
		}
	}

	return normalizedNames;
}

function normalizeName(title) {
	return title.replace(': ', ' - ');
}

function readList(user) {
	return ATFB.Reader.read(user);
}

function generateYaml(list) {
	var series = [];

	Object.keys(list).forEach(function(name) {
		if (list[name].length) {
			var seriesEntry = {};

			seriesEntry[name] = {'alternate_name': list[name]};
			series.push(seriesEntry);
		}
		else {
			series.push(name);
		}
	});

	return Yaml.stringify({
		series: {
			anime: series,
			settings: {
				anime: {
					identified_by: 'sequence',
					upgrade: 'yes',
					timeframe: '6 hours',
					target: '720p',
					qualities: ['480p', '720p']
				}
			}
		}
	}, 2);
}
