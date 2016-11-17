'use strict';
const NameModel = require('./NameModel');
const SeriesModel = require('./SeriesModel');


class AnimeRegistry {
	constructor(app, options) {
		this.app = app;
		this.options = options;
		this.db = this.app.methods.RinBookshelf;

		this.app.methods.RinBookshelf.registerModel('SeriesName', NameModel, 'anime_names');
		this.app.methods.RinBookshelf.registerModel('Series', SeriesModel, 'anime_series');

		this.app.addMethod('storeAnime', this.storeAnime.bind(this));
	}

	storeAnime(animeData, next) {
		this.fetchOrCreateSeries(animeData)
			.then((animeModel) => {
				return Promise.all([animeModel, this.getNames(animeData, animeModel)]);
			})
			.then((data) => {
				return Promise.all([data[0], data[0].related('names').fetch()]);
			})
			.then((data) => {
				const record = data[0].toJSON();
				record.alternativeNames = data[1].reduce((names, model) => {
					let name = model.get('name');

					if (name !== data[0].get('name')) {
						names.push(name);
					}
					return names;
				}, []);

				return next(null, record);
			})
			.catch((err) => {
				return next(err);
			});
	}

	fetchOrCreateSeries(animeData) {
		const Series = this.db.getModel('Series');

		return new Series({anilistId: animeData.anilistId})
			.fetch({
				require: true
			})
			.then((seriesModel) => {
				seriesModel.set({
					episodes: animeData.totalEpisodes,
					imageUrlLge: animeData.imageUrlLge,
					season: animeData.season || 0,
					time: animeData.updatedAt
				});

				if (seriesModel.hasChanged()) {
					return seriesModel.save();
				}
				else {
					return Promise.resolve(seriesModel);
				}
			}, () => {
				return this.registerSeries(animeData);
			});
	}

	registerSeries(animeData) {
		const Name = this.db.getModel('SeriesName');
		const Series = this.db.getModel('Series');

		return new Name({name: animeData.mainName})
			.fetch()
			.then((nameModel) => {
				if (nameModel) {
					return Promise.reject(nameModel.related('series').fetch());
				}
				else {
					return Series.forge({
						anilistId: animeData.anilistId,
						name: animeData.mainName,
						episodes: animeData.totalEpisodes,
						imageUrlLge: animeData.imageUrlLge,
						season: animeData.season || 0,
						time: animeData.updatedAt,
						prequelId: null
					}).save(null, {method: 'insert'});
				}
			});
	}

	getNames(animeData, animeModel) {
		return Promise.all(animeData.alternativeNames.concat([animeData.name])
			.map((name) => {
				return this.saveName(name, name === animeData.name ? 'base' : 'alternative', animeModel.get('anilistId'));
			})
		).then(() => {
			return true;
		});
	}

	saveName(name, type, animeId) {
		const Name = this.db.getModel('SeriesName');

		return Name.forge({
			name: name,
			type: type,
			seriesId: animeId,
			time: Date.now()
		}).save(null, {method: 'insert'}).catch(() => {
			return Promise.resolve();
		});
	}
}

module.exports = AnimeRegistry;
