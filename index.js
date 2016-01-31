var error = require('./error.js'),
	Converter = require('./converter.js');
var converter = new Converter('ya29.dwLkEZJUBhMS-lbLvf-gWVqNXPRqZpuCi8CYQX95ITdDM2C7117hp9Ty1LhOV2pAUEz6');


converter.getContactsAsXml(function(err, result) {
	if (err) return error(err);

	console.log('Finished');
});