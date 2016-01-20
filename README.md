# google-contacts-api-convert
node.js module to convert json received from a call to google contacts api v3 to ATOM XML that can be submitted to the google contacts v3 api to create or update a contact

<b>Usage (pseudo code)</b>

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
<li>Needs testing (a test.js file is included to show what a basic test could look like</li>
</ul>

<b>Background / more information</b>

Envisaged use case for a developer using this module:<br><br>
-Developer wants to 'clone' a google contact from one user's google account to another, or to modify an existing contact<br>
-A contact is obtained from a GET request to <pre>https://www.google.com/m8/feeds/contacts/{user email}/full/{contact Id}?alt=json</pre> (not in scope)<br>
-This contact is maniupulated according to desired business rules (not in scope)<br>
-The developer makes a requst to googleContactJsonToAtomXML passing in the manipulated contact, and receives back valid ATOM XML (in scope)<br>
-The developer makes a POST or PUT request to <code>https://www.google.com/m8/feeds/contacts/{user email}/full/{contact Id}</code> to update or create a new contact (not in scope)
