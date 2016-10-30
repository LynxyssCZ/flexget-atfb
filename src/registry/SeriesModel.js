'use strict';
module.exports = function register(Bookshelf, tableName) {
	const Series = Bookshelf.Model.extend({
		idAttribute: 'anilistId',
		tableName: tableName,
		names: function () {
			return this.hasMany('SeriesName', 'series_id');
		}
	});

	const SeriesList = Bookshelf.Collection.extend({
		model: Series
	});

	const tableCreate = function createTable(table) {
		table.integer('anilist_id').unique().primary();
		table.string('name').unique();
		table.integer('episodes');
		table.integer('season');
		table.integer('prequel_id');
		table.string('image_url_lge');
		table.timestamp('time');
	};

	const updateSchema = function updateSchedulesSchema(currentVersion, knex) {
		return knex.schema.dropTableIfExists(tableName)
			.createTable(tableName, tableCreate);
	};

	return {
		version: 1,
		update: updateSchema,
		Model: Bookshelf.model('Series', Series),
		Collection: Bookshelf.collection('SeriesList', SeriesList)
	};
};
