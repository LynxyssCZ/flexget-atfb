'use strict';
const superagent = require('superagent');

const SERVER = 'https://anilist.co/api/';

class AnilistReader {
	constructor(app, options) {
		this.app = app;
		this.options = options;

		this.app.addMethod('getUserList', (user, listTypes) => {
			return this.authorize()
				.then(() => {
					return this.getUserList(user, listTypes);
				});
		});

		this.app.addMethod('getAnimeData', (animeId) => {
			return this.authorize()
				.then(() => {
					return this.getAnimeData(animeId);
				});
		});
	}

	getUserList(user, listTypes) {
		console.log(SERVER + 'user/' + user + '/animelist');
		return superagent.get(SERVER + 'user/' + user + '/animelist')
			.accept('json')
			.query({ access_token: this.accessToken })
			.then((res) => {
				return Promise.resolve(res.body.lists);
			}, (err) => {
				return Promise.reject(err);
			})
			.then((lists) => {
				const itemList = listTypes.reduce((animeList, listName) => {
					return animeList.concat(lists[listName] || []);
				}, []);
				return Promise.resolve(this.parseUserList(itemList));
			});
	}

	getAnimeData(animeId) {
		return superagent.get(SERVER + 'anime/' + animeId + '/page')
			.accept('json')
			.query({ access_token: this.accessToken })
			.then((res) => {
				return Promise.resolve(res.body);
			}, (err) => {
				return Promise.reject(err);
			})
			.then((data) => {
				if (data) {
					return Promise.resolve(this.parseAnimeData(data));
				}
				else {
					return Promise.reject('No data');
				}
			});
	}

	authorize() {
		if (this.accessToken && this.authExp > Date.now() + 15 * 60 * 1000) {
			return Promise.resolve(true);
		}
		else {
			return this.getToken();
		}
	}

	getToken() {
		return superagent.post(SERVER + 'auth/access_token')
			.accept('json')
			.send({
				grant_type: 'client_credentials',
				client_id: this.options.clientId,
				client_secret: this.options.apiKey
			})
			.then((res) => {
				this.storeToken(res.body);

				return Promise.resolve(true);
			}, (err) => {
				return Promise.reject(err);
			});
	}

	storeToken(response) {
		this.accessToken = response.access_token;
		this.authExp = response.expires;
	}

	parseUserList(userList) {
		return userList.map((listItem) => {
			const anime = listItem.anime || {};
			let names = [];

			if (anime.title_english) {
				names.push(anime.title_english);
			}

			if (anime.synonyms) {
				names = names.concat(anime.synonyms);
			}

			return {
				anilistId: anime.id,
				name: anime.title_romaji,
				japaneseName: anime.title_japanese,
				alternativeNames: names,
				listStatus: listItem.list_status,
				type: anime.type,
				updatedAt: anime.updated_at,
				imageUrlLge: anime.image_url_lge,
				totalEpisodes: anime.total_episodes,
				airingStatus: anime.airing_status,
				season: anime.season
			};
		});
	}

	parseAnimeData(animeData) {
		let related = this.getRelated(animeData.relations);
		let names = [];

		if (animeData.title_english) {
			names.push(animeData.title_english);
		}

		if (animeData.synonyms) {
			names = names.concat(animeData.synonyms);
		}

		return {
			anilistId: animeData.id,
			name: animeData.title_romaji,
			japaneseName: animeData.title_japanese,
			alternativeNames: names,
			type: animeData.type,
			updatedAt: animeData.updated_at,
			imageUrlLge: animeData.image_url_lge,
			totalEpisodes: animeData.total_episodes,
			airingStatus: animeData.airing_status,
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

module.exports = AnilistReader;
