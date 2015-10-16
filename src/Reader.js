'use strict';

var FeedParser = require('feedparser');
var request = require('request');

module.exports.read = function(url, options, callback) {
	var req = request(url);
	var feedParser = new FeedParser(options);
	var items = [];

	req.on('error', function(error) {
		return callback(error);
	});

	req.on('response', function(res) {
		var stream = this;

		if (res.statusCode !== 200) {
			callback('error');
		}

		stream.pipe(feedParser);
	});

	feedParser.on('error', function(error) {
		return callback(error);
	});

	feedParser.on('readable', function() {
		var stream = this;
		var item = stream.read();

		while (item) {
			items.push(item);
			item = stream.read();
		}
	});

	feedParser.on('end', function() {
		return callback(null, items);
	});
};
