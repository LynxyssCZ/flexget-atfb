'use strict';
const Yaml = require('yamljs');
const fs = require('fs');
const Shell = require('shelljs');


class FlexgetConfigGenerator {
	constructor(app, options) {
		this.app = app;
		this.options = options;

		this.app.addMethod('updateConfig', this.updateConfig.bind(this));

		this.currentHash = undefined;
	}

	updateConfig(seriesList, next) {
		const seriesConfig = {
			series: {
				anime: this.generateAnimeConfig(seriesList),
				settings: {
					anime: FlexgetConfigGenerator.baseConfig
				}
			}
		};

		this.writeConfig(seriesConfig, next);
	}

	writeConfig(seriesConfig, next) {
		fs.writeFile(this.options.filename, Yaml.stringify(seriesConfig, 10, 2), (err) => {
			if (!err) {
				Shell.exec(this.options.command, () => {
					next();
				});
			}
			else {
				return next(err);
			}
		});
	}

	generateAnimeConfig(seriesList) {
		return seriesList.map((series) => {
			if (series.alternativeNames.length > 0) {
				return {
					[series.name]: {
						alternate_name: series.alternativeNames
					}
				};
			}
			else {
				return series.name;
			}
		});
	}
}

FlexgetConfigGenerator.baseConfig = {
	identified_by: 'sequence',
	upgrade: 'yes',
	timeframe: '6 minutes',
	target: '720p',
	exact: 'yes',
	qualities: ['576p', '720p']

};

module.exports = FlexgetConfigGenerator;
