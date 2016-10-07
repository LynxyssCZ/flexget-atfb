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
				return Promise.resolve(itemList);
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
}

module.exports = AnilistReader;
