'use strict';
module.exports = function register(Bookshelf, tableName) {
	const SeriesName = Bookshelf.Model.extend({
		tableName: tableName,
		hidden: ['id'],
		series: function () {
			return this.belongsTo('Series');
		}
	});

	const SeriesNames = Bookshelf.Collection.extend({
		model: SeriesName
	});

	const tableCreate = function createTable(table) {
		table.string('name').unique().primary();
		table.enum('type', ['base', 'alternative']);
		table.integer('series_id');
		table.timestamp('time');
	};

	const updateSchema = function updateSchedulesSchema(currentVersion, knex) {
		return knex.schema.dropTableIfExists(tableName)
			.createTable(tableName, tableCreate);
	};

	return {
		version: 1,
		update: updateSchema,
		Model: Bookshelf.model('SeriesName', SeriesName),
		Collection: Bookshelf.collection('SeriesNames', SeriesNames)
	};
};
