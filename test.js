var convert = require('./converter.js');

var error = require('./error.js'),
	request = require('request'), // will perform the actual HTTP request for us
	xml2js = require('xml2js');

	// set this to "false" if you want to update the contacts, rather then creating them
	// keep in mind that, for updating purposes, the contact has to already exist within the user account having the same id
var adding = true,
	// whether or not to log the response (which contains the list of read contacts), the result (which contains the batch xml code) and the status' (list of 4xx error messages upon creating/updating) shall be written into files
	logging = false,
	// how many contacts should be read within a single request (all contacts will become read, using pagination)
	maxContactsPerRequest = 100,
	// the access token for reading the contacts
	token = 'ya29.egKkxRCEVJwG6EaW_4JP_eH6dsJgzDNmlXp-gfVxwduNjR5gZ98I0gOTHpY_syNZ1ely',
	// the access token for creating/updating the contacts
	tokenPost = 'ya29.egKknhnA9NSVit-W32_eWVPNcyiwQfCkFhvnW_tAkRovlWzHqYQXsrJJkpR49fIqogHP';

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

// reset log file
if (logging && require('fs').existsSync('./status.txt')) require('fs').unlinkSync('./status.txt', '');

// start with requesting the first page - at index 1 (Contact API's indexes aren't zero-based)
requestPage(1, function(err, result) {
	if (err) return error(err);

	// convert it into an adding/updating batch request
	convert(responses, adding, function(err, result) {
		if (err) return error(err);

		// logging
		if (logging) require('fs').writeFileSync('./response.xml', result);

		// request options for creating/updating the contacts
		var options = {
			url: 'https://www.google.com/m8/feeds/contacts/default/full/batch/',
			headers: {
				'Gdata-version': 3,
				// important! Buffer.byteLength is correct, result.length is not!
				'Content-length': Buffer.byteLength(result, 'utf8'),
				// add the token for authorization
				'Authorization': 'Bearer '+tokenPost,
				'Content-type': 'application/atom+xml'
			},
			method: 'POST',
			body: result
		};
		console.log('Creating/updating contacts...');

		// create/update the contacts
		request(options, function(err, response, body) {
			if (err) return error(err);

			// logging
			console.log('Received response');
			if (logging) require('fs').writeFileSync('./result.xml', body);

			// compile response for error checking
			xml2js.parseString(body, function(err, data) {
				if (err) return error(err);

				// search within response for errors
				var errors = 0;
				for (var i = 0; i < data.feed.entry.length; ++i) {
					var entry = data.feed.entry[i];
					if (!entry['batch:status']) continue;

					// find all elements containing status information about the batch operation of this entry
					for (var j = 0; j < entry['batch:status'].length; ++j) {
						var status = entry['batch:status'][j];

						// check if the status contains an erronous code
						if (status['$'].code.indexOf('4') == 0) {
							++errors;

							// log the error for debugging purposes
							var message = '#'+(i+1)+' ERR '+status['$'].code+': '+status['$'].reason;
							if (logging) require('fs').appendFileSync('status.txt', message+'\n');
							console.log(message);
						}
					}
				}

				// print status message
				var success = data.feed.entry.length-errors; // the amount of successfull updates/creations
				var percentage = success/data.feed.entry.length; // calculating the percentage for a more usable output
				console.log(success+'/'+data.feed.entry.length+' were successfull ('+parseInt(percentage*100)+'%).');
			});
		});
	});
}.bind(this));