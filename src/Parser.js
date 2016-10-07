'use strict';

class AnilistParser {
	constructor(app, options) {
		this.app = app;
		this.options = options;

		this.app.addMethod('parseUserList', this.parseUserList.bind(this));
		this.app.addMethod('parseAnimeData', this.parseAnimeData.bind(this));
	}

	parseUserList(userList) {
		return userList.map((listItem) => {
			const anime = listItem.anime || {};

			return {
				anilistId: anime.id,
				titleRomanji: anime.title_romaji,
				titleEnglish: anime.title_english,
				titleJapanese: anime.title_japanese,
				listStatus: listItem.list_status,
				type: anime.type,
				updatedAt: anime.updated_at,
				imageUrlLge: anime.image_url_lge,
				totalEpisodes: anime.total_episodes,
				airingStatus: anime.airing_status,
				synonyms: anime.synonyms,
				season: anime.season
			};
		});
	}

	parseAnimeData(animeData) {
		let related = this.getRelated(animeData.relations);

		return {
			anilistId: animeData.id,
			titleRomanji: animeData.title_romaji,
			titleEnglish: animeData.title_english,
			titleJapanese: animeData.title_japanese,
			type: animeData.type,
			updatedAt: animeData.updated_at,
			imageUrlLge: animeData.image_url_lge,
			totalEpisodes: animeData.total_episodes,
			airingStatus: animeData.airing_status,
			synonyms: animeData.synonyms,
			season: animeData.season,
			prequel: related.prequel,
			sequel: related.sequel
		};
	}

	getRelated(relations) {
		return relations.reduce((related, anime) => {
			if (anime.type === 'TV') {
				if (anime.relation_type === 'prequel') {
					related.prequel = anime.id;
				}
				else if (anime.relation_type === 'sequel') {
					related.sequel = anime.id;
				}
			}

			return related;
		}, {
			sequel: undefined,
			prequel: undefined
		});
	}
}

module.exports = AnilistParser;
