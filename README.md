# google-contacts-api-convert

## Usage

    var Converter = require('google-contacts-api-convert');
    var converter = new Converter('your-access-token');

    // receiving the BATCH creation document
    converter.getContactsAsXml(function(err, xml) {
    	if (err) throw err;

    	console.log(xml);
    });

    // receiving the BATCH update document
    converter.getContactsAsXml(false, function(err, xml) {
    	if (err) throw err;

    	console.log(xml);
    });

## Notes

 - the converter fetches ALL contacts of the given user, no matter what size
 - everything was successfully tested with 830 contacts
 - the converter puts all contacts into one resulting batch document, BUT google contacts api only accepts up to 100 contacts within a single batch request
 - the `error.js`-file is used as a simple error handler. just to unify exception catching & logging
