# google-contacts-api-convert

## Usage

    var convert = require('google-contacts-api-convert');

    convert('xmlReceuvedFromGoogleContactsAPI',function(err,response) {
    console.log ("submit this XML back to Google contacts API to create a contact " + response);
    });

## Notes

 - the converter fetches ALL contacts of the given user, no matter what size
 - everything was successfully tested with 830 contacts
 - the converter puts all contacts into one resulting batch document, BUT google contacts api only accepts up to 100 contacts within a single batch request
 - the `error.js`-file is used as a simple error handler. just to unify exception catching & logging
