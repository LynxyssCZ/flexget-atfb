var path = require('path');

module.exports = {
	client: 'sqlite3',
	connection: {
		filename: path.join(__dirname, 'const', 'atfb.sqlite')
	},
	useNullAsDefault: false
};
