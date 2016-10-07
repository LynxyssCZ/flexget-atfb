'use strict';
const NameModel = require('./NameModel');
const SeriesModel = require('./SeriesModel');

class AnimeRegistry {
	constructor(app, options) {
		this.app = app;
		this.options = options;

		this.app.methods.RinBookshelf.registerModel('Name', NameModel, 'anime_names');
		this.app.methods.RinBookshelf.registerModel('Series', SeriesModel, 'anime_series');
	}
}

module.exports = AnimeRegistry;
