'use strict';

var register = function(server, options, next) {
	next();
};

register.attributes = {
	name: 'ATFB-RSS-Server',
	version: '1.0.0'
};

module.exports = {
	register: register
};
