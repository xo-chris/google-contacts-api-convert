# google-contacts-api-convert
Convert json received from google contacts api v3 to ATOM XML that can be submitted to the google contacts v3 api to create or update a contact

<b>To do:</b>

<ul><li>Needs to be a proper module (so 'exports')</li>
<li>Needs the googleContactJsonToAtomXML method fully completed</li>
<li>Needs testing against at least two live google accounts</li>
</ul>

<b>Background / more information</b>

Envisaged use case for a developer using this module:<br><br>
-Developer wants to 'clone' a google contact from one user's google account to another, or to modify an existing contact<br>
-A contact is obtained from a GET request to https://www.google.com/m8/feeds/contacts/{user email}/full/{contact Id}?alt=json (not in scope)<br>
-This contact is maniupulated according to desired business value (not in scope)<br>
-The developer makes a requst to googleContactJsonToAtomXML passing in the manipulated contact, and receives back valid ATOM XML (in scope)<br>
-The developer makes a POST or PUT request to https://www.google.com/m8/feeds/contacts/{user email}/full/{contact Id} to update or create a new contact (not in scope)
