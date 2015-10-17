'use strict';
require('dotenv').load();
var Bluebird = require('bluebird');
var Yaml = require('yamljs');
var fs = require('fs');
var ATFB = require('./src');

var usersString = process.env.USERS;
var shortNames = process.env.SHORT_NAMES.split(';');

refresh();

function refresh() {
	Bluebird.map(usersString.split(';'), readList)
	.reduce(normalizeList, Object.create(null))
	.then(writeList);
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

function writeList(list) {
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

	fs.writeFile(
		process.env.SERIES_FILE,
		Yaml.stringify({
			series: {
				anime: series,
				settings: {
					anime: {
						identified_by: 'sequence'
					}
				}
			}
		}, 2),
		function() {

		}
	);
}
