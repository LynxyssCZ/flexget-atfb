'use strict';
const superagent = require('superagent');


class SeriesNamesGenerator {
	constructor(app, options) {
		this.app = app;
		this.options = options;
		this.logger = app.logger.child({component: 'namesGenerator'});

		this.app.addMethod('generateNames', this.generateNames.bind(this));
		this.app.addMethod('getManualAlternatives', this.getManualAlternatives.bind(this));
	}

	generateNames(seriesItem) {
		return Object.assign({}, seriesItem, {
			mainName: this.normalizeName(seriesItem.name),
			alternativeNames: this.getAlternativeNames(seriesItem)
		});
	}

	getAlternativeNames(seriesItem) {
		const namesSet = new Set();
		const alternativeNames = [];

		this.generateNameVariations(seriesItem.name)
			.forEach(namesSet.add, namesSet);

		seriesItem.alternativeNames.forEach((synonym) => {
			if (synonym && synonym.length > 0) {
				namesSet.add(synonym);
				this.generateNameVariations(synonym)
					.forEach(namesSet.add, namesSet);
			}
		}, this);

		namesSet.delete(this.normalizeName(seriesItem.name));
		namesSet.forEach((name) => {
			if (name && name.length > 0) {
				alternativeNames.push(name);
			}
		});

		return alternativeNames;
	}

	getManualAlternatives(seriesId) {

	}

	generateNameVariations(name) {
		if (name.indexOf(':')) {
			return [
				this.normalizeName(name)
			];
		}
		else {
			return [];
		}
	}

	normalizeName(name) {
		return name.replace(': ', ' - ').trim();
	}

	getShortName(name) {
		return name.split(':')[0].trim();
	}
}

module.exports = SeriesNamesGenerator;
