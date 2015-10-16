'use strict';
require('dotenv').load();
var Bluebird = require('bluebird');
var ATFB = require('./src');

var feedString = process.env.FEEDS;

// map inside a map bullcrap
Bluebird.map(parseFeeds(feedString), readFeed)
	.map(function(items) {
		return items.map(parseItem);
	});

function parseFeeds(feedsString) {
	return new Bluebird(function(resolve) {
		var feeds = feedsString.split('|');
		resolve(feeds);
	});
}

function parseItem(item) {
	console.log(item);
}

function readFeed(url) {
	return ATFB.Reader.readAsync(url, null)
		.map(function(item) {
			return item.summary;
		})
		.error(function(err) {
			return [];
		});
}
