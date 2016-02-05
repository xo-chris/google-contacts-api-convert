# google-contacts-api-convert

## Usage

    var convert = require('google-contacts-api-convert');

    convert('xmlReceuvedFromGoogleContactsAPI',function(err,response) {
    console.log ("submit this XML back to Google contacts API to create a contact " + response);
    });

## Notes

 - Includes 'tests.js' which includes code to GET xml from google contacts API, transform it and submit is back to google contacts API to create and modify contacts
 - Tested with google contacts API V3 https://developers.google.com/google-apps/contacts/v3/reference Code may work with versions 1 or 2 but has not been tested
