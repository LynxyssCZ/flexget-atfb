'use strict';
var Promise = require('bluebird');
var Request = Promise.promisify(require("request"));

var LISTS = ['watching', 'plan to watch'];
var SERVER = 'https://anilist.co/api/';

module.exports.read = function read(user, callback) {
	return getToken()
	.then(function(token) {
		return getLists(user, token);
	})
	.then(function(lists) {
		return LISTS.map(function(list) {
			if (lists.hasOwnProperty(list)) {
				return lists[list];
			}
		});
	})
	.then(function(lists) {
		return lists.reduce(function(items, list) {
			return items.concat(list.map(function(item) {
				return parseEntry(item);
			}));
		}, []);
	});
};

function getToken() {
	return Request({
		url: '/auth/access_token',
		baseUrl: SERVER,
		method: 'POST',
		json: true,
		body: {
			grant_type: "client_credentials",
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.API_KEY
		}
	}).get(1)
	.then(function(body) {
		return body.access_token;
	});
}

function getLists(user, token) {
	return Request({
		url: '/user/' + user + '/animelist',
		qs: {
			access_token: token
		},
		baseUrl: SERVER,
		json: true
	}).get(1)
	.then(function(data) {
		return data.lists;
	});
}

function parseEntry(item) {
	return {
		title: item.anime.title_romaji,
		alternateTitle: item.anime.title_english,
		synonyms: item.anime.synonyms
	};
}
