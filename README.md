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


node.js module to convert json received from a call to google contacts api v3 to ATOM XML that can be submitted to the google contacts v3 api to create or update a contact

<b>Usage</b>

<code>
//make a call to Google API and obtain a contact and store this in variable googleContactJsonString

var myConvert = require('google-contacts-api-convert');
myConvert.googleContactJsonToAtomXML(true,googleContactJsonString), function (error, myAtom) {
  //submit myATOM to google contacts API to add or update a contact
  }
})
</code>

<b>To do:</b>

<ul><li>Needs to be a proper module (so 'exports')</li>
<li>Needs the googleContactJsonToAtomXML method fully completed</li>
<li>Needs testing (a test.js file is included to show what a basic test could look like)</li>
</ul>

<b>Background / more information</b>

Envisaged use case for a developer using this module:<br><br>
-Developer wants to 'clone' a google contact from one user's google account to another, or to modify an existing contact<br>
-A contact is obtained from a GET request to <code>https://www.google.com/m8/feeds/contacts/{user email}/full/{contact Id}?alt=json</code> (not in scope)<br>
-This contact is maniupulated according to desired business rules (not in scope)<br>
-The developer makes a requst to googleContactJsonToAtomXML passing in the manipulated contact, and receives back valid ATOM XML (in scope)<br>
-The developer makes a POST or PUT request to <code>https://www.google.com/m8/feeds/contacts/{user email}/full/{contact Id}</code> psoting the new ATOM XML  to update or create a new contact (not in scope)
