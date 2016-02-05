# google-contacts-api-convert

## Usage

    var convert = require('google-contacts-api-convert');

    convert('xmlReceuvedFromGoogleContactsAPI',function(err,response) {
    console.log ("submit this XML back to Google contacts API to create a contact " + response);
    });

## Notes

 - Includes 'tests.js' which includes code to GET xml from google contacts API, transform it and POST it back to google contacts API to create and modify contacts
 - Tested with google contacts API V3 https://developers.google.com/google-apps/contacts/v3/reference Code may work with versions 1 or 2 but has not been tested
 - Includes batching functionality - transformed XML is returned as an array of add / update XML statements (max batch size supported by google contacts API is 100)
 - Will not add or update groups.  Groups are specific to an individual user and require calls to https://www.google.com/m8/feeds/groups/userEmail/projection (not included)
 - Will not add or update photos.  Photos are modified by calls to 'http://google.com/m8/feeds/photos/media/userEmail/id (not included)
 
## Future Development

 - Going forward groups / photos functionality may be handy
 - It would be great to add transform functions for other APIs such as MailChimp, Xero etc
 
