function deepCopy(original, excludes) {
	if (!excludes) excludes = [];
	if (typeof original === 'string' || original instanceof String || original instanceof Number) return original;

	var copy = {};
	for (var name in original)
		if (original.hasOwnProperty(name) && excludes.indexOf(name) < 0)
			copy[name] = deepCopy(original[name], excludes);

	return copy;
}

/**
 * Creates an ATOM XML batch request out of an ATOM XML document for the Contacts API.
 *
 * @param responses	String[] | String	contains either a single request body containing contacts in XML-structure, or an array containing several request bodies, each containing contacts in XML-structure
 * @param adding	Boolean	optional; true determines that the XML document will be prepared for adding contacts, false determines the document to update contacts
 *							default: true
 * @param callback	Function	gets called after all the contacts have been fetched and the XML document was created
 *								receives an exception as first parameter (or an error-describing XML response from the Google API) if something fails, and otherwise receives the final XML documents as the second parameter as an Array of Strings, each containing a single batch request body
 *								callback(err, [xml])
 */
var getContactsAsXml = function(responses, adding, callback) {
	// make "responses" an array
	if (!Array.isArray(responses)) responses = [responses];

	// make "adding"-parameter optional and default it to true
	if (!callback) {
		callback = adding;
		adding = true;
	}

	// import modules
	var async = require('async'),
		fs = require('fs'), // required only for logging purposes during debugging
		xml2js = require('xml2js'); // will help us converting the XML response into JSON and back into XML after conversion

	// will get called after all responses have been parsed into JSON
	var parsingDone = function(err, result) {
		if (err) return callback(err);

		// traverse through all results, to clear them from any elements not containing the entrys (like response metadata)
		for (var name in result.feed) {
			// clear all elements except for entries
			if (name != 'entry') {
				delete result.feed[name];
				continue;
			}
		}

		// loop through the entries
		if (result.feed.entry) for (var i = 0; i < result.feed.entry.length; ++i) {
			// delete the group information - as discussed within Freelancer.com chat
			delete result.feed.entry[i]['gContact:groupMembershipInfo'];

			// add metadata to make sure the entries will become created/updated during the batch request
			result.feed.entry[i]['batch:id'] = adding ? 'create' : 'update'; // create a "batch:id"-element, containing the text "create" or "update"
			result.feed.entry[i]['batch:operation'] = {'$': {type: adding ? 'insert' : 'update'}}; // the $ simply means, that "type" will be an attribute to the "batch:operation"-element, and not a child
		}

		console.log(result.feed.entry.length);

		// split results
		var results = [];
		for (var i = 0; i < result.feed.entry.length; ++i) {
			var arrayIndex = parseInt(i / 100);
			if (!results[arrayIndex]) {
				results[arrayIndex] = deepCopy(result, ['entry']);
				results[arrayIndex].feed.entry = [];
			}
			results[arrayIndex].feed.entry.push(result.feed.entry[i]);
		}

		// add attributes to the root element in order to link to schemes correctly
		for (var i = 0; i < results.length; ++i) {
			results[i].feed['$'] = {
				xmlns: 'http://www.w3.org/2005/Atom',
				'xmlns:gContact': 'http://schemas.google.com/contact/2008',
				'xmlns:gd': 'http://schemas.google.com/g/2005',
				'xmlns:batch': 'http://schemas.google.com/gdata/batch'
			};
		}

		// convert the gathered JSON object back to XML
		var builder = new xml2js.Builder();

		for (var i = 0; i < results.length; ++i) {
			results[i] = builder.buildObject(results[i]);
		}

		// call callback
		callback(undefined, results);
	}

	// will gather entry information
	var result;

	// parse all responses, in series (which will allow concatenating the arrays without running into Thread-issues)
	async.eachSeries(responses, function(response, next) {
		// if the response is empty, skip it
		if (!response || response.trim().length == 0) return next();

		// convert XML to JSON
		xml2js.parseString(response, function(err, result2) {
			if (err) return next(err);
			if (!result) result = result2;
				// skip response if it does not contain any entries
			else if (!result2.feed.entry || result2.feed.entry.length == 0) return next();
				// gather feed entries in one list
			else result.feed.entry = result.feed.entry.concat(result2.feed.entry);
			next();
		});
	}, function(err) {
		if (err) return parsingDone(err);
		if (result.errors) return parsingDone(result.errors.error);

		// converting the XML into JSON done successfull - call callback
		parsingDone(undefined, result);
	});
};

// export the main class
module.exports = getContactsAsXml;