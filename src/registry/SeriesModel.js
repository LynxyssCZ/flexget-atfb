'use strict';
module.exports = function register(Bookshelf, tableName) {
	const Series = Bookshelf.Model.extend({
		tableName: tableName,
		hidden: ['id'],
		names: function () {
			return this.hasMany('SeriesName');
		}
	});

	const SeriesList = Bookshelf.Collection.extend({
		model: Series
	});

	const tableCreate = function createTable(table) {
		table.string('anilist_id').unique().primary();
		table.string('name').unique();
		table.integer('episodes');
		table.integer('type');
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
