/**
 * Initializes the Contacts Converter and sets the authorization token.
 * Debugging may be enabled for logging.
 *
 * @param token	String	contains the request token
 * @param debug	Boolean	optional; if true, the debug mode will be enabled, and the response of the Google Contacts API as well as the finally created document will be logged into files "input.xml" and "result.xml"
 *						default: false
 */
var Converter = function(token, debug) {
	this.token = token;
	this.maxContactsPerRequest = 1000;
	this.maxTotalContacts = -1;
	this.debug = debug !== undefined ? debug : false;
};

/**
 * Fetches a list of all existing contacts and creates an ATOM XML feed, which allows to create or update such users.
 *
 * @param adding	Boolean	optional; true determines that the XML document will be prepared for adding contacts, false determines the document to update contacts
 *							default: true
 * @param callback	Function	gets called after all the contacts have been fetched and the XML document was created
 *								receives an exception as first parameter (or an error-describing XML response from the Google API) if something fails, and otherwise receives the final XML document as the second parameter as a String
 *								callback(err, xml)
 */
Converter.prototype.getContactsAsXml = function(adding, callback) {
	// make "adding"-parameter optional and default it to true
	if (!callback) {
		callback = adding;
		adding = true;
	}

	// import modules
	var fs = require('fs'), // required only for logging purposes during debugging
		request = require('request'), // will perform the actual HTTP request for us
		xml2js = require('xml2js'); // will help us converting the XML response into JSON and back into XML after conversion

	var requestPage = function(index, callback2) {
		// debugging output
		if (this.debug) console.log('Fetching page, starting #'+index);

		// the request metadata
		var options = {
			// the endpoint and the following parameters:
			//	alt=atom	the response from the google server will be written in ATOM XML instead of JSON. this will ease the conversion back into ATOM XML later
			//	max-results=1000	it is required for pagination to determine the maximum result length, and 1000 seemed as a good starting point as the result was (during test cases) 1MB to 1.5MB
			url: 'https://www.google.com/m8/feeds/contacts/default/full/?alt=atom&max-results='+this.maxContactsPerRequest+'&start-index='+index,
			headers: {
				'Gdata-version': 3,
				'Content-Length': 0,
				'Authorization': 'Bearer '+this.token
			}
		};

		// do the request and receive the response
		request(options, function(err, response, body) {
			if (err) return callback2(err);

			// for debugging purposes: log the response to find XML parsing or conversion errors
			if (this.debug) fs.writeFileSync('./input.xml', body);

			// parse the string to a JSON object, in order to make the conversion easier
			xml2js.parseString(body, function(err, result) {
				if (err) return callback2(body);
				if (result.errors) return callback2(result.errors.error);
				if (result.feed.entry.length < this.maxContactsPerRequest) return callback2(undefined, result);

				requestPage(index+result.feed.entry.length, function(err, result2) {
					if (err) return callback2(err);

					result.feed.entry = result.feed.entry.concat(result2.feed.entry);
					callback2(undefined, result);
				});
			}.bind(this));
		}.bind(this));
	}.bind(this);

	// start with requesting the first page - at index 0
	requestPage(1, function(err, result) {
		if (err) return callback(err);

		// debugging output
		if (this.debug) console.log(result.feed.entry.length+' Einträge gefunden');

		// traverse through all results, to clear them from any elements not containing the entrys (like response metadata)
		for (var name in result.feed) {
			// clear all elements except for entries
			if (name != 'entry') {
				delete result.feed[name];
				continue;
			}
		}

		// loop through the entries
		for (var i = 0; i < result.feed.entry.length; ++i) {
			// delete the group information - as discussed within Freelancer.com chat
			delete result.feed.entry[i]['gContact:groupMembershipInfo'];

			// add metadata to make sure the entries will become created/updated during the batch request
			result.feed.entry[i]['batch:id'] = adding ? 'create' : 'update'; // create a "batch:id"-element, containing the text "create" or "update"
			result.feed.entry[i]['batch:operation'] = {'$': {type: adding ? 'insert' : 'update'}}; // the $ simply means, that "type" will be an attribute to the "batch:operation"-element, and not a child
		}

		// add attributes to the root element in order to link to schemes correctly
		result.feed['$'] = {
			xmlns: 'http://www.w3.org/2005/Atom',
			'xmlns:gContact': 'http://schemas.google.com/contact/2008',
			'xmlns:gd': 'http://schemas.google.com/g/2005',
			'xmlns:batch': 'http://schemas.google.com/gdata/batch'
		};

		// convert the gathered JSON object back to XML
		var builder = new xml2js.Builder();
		var xml = builder.buildObject(result);

		// for debugging purposes: log the result
		if (this.debug) fs.writeFileSync('./result.xml', xml);

		// call callback
		callback(undefined, xml);
	}.bind(this));
};

// export the main class
module.exports = Converter;