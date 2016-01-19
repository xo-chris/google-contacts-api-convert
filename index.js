/*
Placeholders for methods and code stubs to illustrate desired functionality

method should fully implement the google contact API specifications at
https://developers.google.com/google-apps/contacts/v3/reference

*/


function googleContactJsonToAtomXML(addContact,contactJson){

  //addContact is a boolean value, if true we are generating ATOM XML to add  a new contact
  //if addContact is false we are generating an ATOM XML string to update a contactJson

  //create a JSON contact object from JSON we have received from a GET request to
  //https://www.google.com/m8/feeds/contacts/{user email}/full/{contact Id}?alt=json";
  var contact = JSON.parse(contactJson)

  //using the contact, create ATOM XML that can be submitted as a POST or PUT request to
  //https://www.google.com/m8/feeds/contacts/{user email}/full/{contact Id}";
  var contactAtom = "valid XML atom update string";

  //return the string that can be POST-ed (if addContact is false) or PUT (if addContact is true) to the google API
  return contactAtom;

  
}
