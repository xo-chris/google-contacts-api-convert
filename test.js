var convert = require('./converter.js');

var error = require('./error.js'),
	request = require('request'), // will perform the actual HTTP request for us
	xml2js = require('xml2js');

	// how many contacts should be read within a single request
var maxContactsPerRequest = 100,
	// the access token for reading the contacts
	token = 'ya29.egK7ZqINDJ2Bk4BAI0bipXXx1hF-iJpRbljY5uwlLJY00DEqWLwLTZnXONqhjS69B08L';

var responses = [];


var requestPage = function(index, callback) {
	// the request metadata
	var options = {
		// the endpoint and the following parameters:
		//  alt=atom  the response from the google server will be written in ATOM XML instead of JSON. this will ease the conversion back into ATOM XML later
		//  max-results=?  it is required for pagination to determine the maximum result length, and 1000 seemed as a good starting point as the result was (during test cases) 1MB to 1.5MB
		url: 'https://www.google.com/m8/feeds/contacts/default/full/?alt=atom&max-results='+maxContactsPerRequest+'&start-index='+index,
		headers: {
			'Gdata-version': 3,
			'Content-Length': 0,
			'Authorization': 'Bearer '+token
		}
	};

	// do the request and receive the response
	request(options, function(err, response, body) {
		if (err) return callback(err);

		// add response body to list of responses
		responses.push(body);

		// convert XML to JSON, in order to check whether another API request is required
		xml2js.parseString(body, function(err, result) {
			if (err) return callback(err);
			if (!result.feed.entry || result.feed.entry.length < this.maxContactsPerRequest) return callback(undefined, result);

			// request next page of contacts
			requestPage(index+result.feed.entry.length, function(err, result2) {
				if (err) return callback(err);

				// concatenate resulting contact entries
				result.feed.entry = result.feed.entry.concat(result2.feed.entry);
				callback(undefined, result);
			});
		});
	}.bind(this));
}.bind(this);

// start with requesting the first page - at index 1 (Contact API's indexes aren't zero-based)
requestPage(1, function(err, result) {
	if (err) return error(err);

	convert(responses, function(err) {
		if (err) return error(err);

		console.log('Finished');
	});
}.bind(this));