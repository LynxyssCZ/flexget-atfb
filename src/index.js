var register = function(server, options, next) {
	server.register([
		{ register: require('./Server') },
		{ register: require('./Reader') }
	], function(err) {
		next(err);
	});
};

register.attributes = {
	name: 'ATFB-RSS-Package',
	version: '1.0.0'
};

module.exports = {
	register: register
};


