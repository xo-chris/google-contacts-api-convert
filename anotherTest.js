//download a single contact, convert the XML and submit to the google api

var request = require("request");
var xml2js = require('xml2js');
var async = require("async");

//global variables
var maxContacts = 10;
var googleUser = "chris@exosphereapps.com";
var token = "ya29.ewL9-6kO10a9xAstgS1ntTVkp3qDiPKQeSAsqBumjIRA3rwhu_g2O8s7yoJNdCu35vi_";

var targetGoogleUser = "fred@exosphereapps.com";
var targetToken = 'ya29.ewL_KFwrhL1ujAXAE26Ow5NXb0pAeiFTT9u6I3Ml7pAmAm62e76S4T6ERYV7T3jvHQZD3xGMu0n6NslsS8BfXhAYS-AivuPeQ1P8885UdYUK43PK1g';


/*
add all contacts with 'xo_sync' present in a field e.g. the contact notes or a custom field

expected result:  I have two contacts with 'xo_sync' present.  I would expect both contacts to be added to the target google user's contacts

what actually happens (for me): the parsed XML contains three <entry> nodes (I would expect two) and a single, blank contact is added


TODO:  write an 'update contacts' function that would get all contacts with 'xo_sync' present, modify them e.g. change the name and then submit
the update back to the api
*/
addContacts("xo_sync");


function addContacts(query){
  async.waterfall([
    getContact.bind(null,query),
    convertContact,
    submitContact
  ],
  // this gets called at the end
  function( err){
    if (err) throw err;
  });
}

function getContact(query,callback){

  console.log('getting contact');
  var url =  'https://www.google.com/m8/feeds/contacts/' + googleUser + '/full/?alt=atom&max-results='+maxContacts + '&q=' + query;

  var options = {
    url: url,
    headers: {
      'Gdata-version': 3,
      'Content-Length': 0,
      'Authorization': 'Bearer '+token
    }
  };

  // do the request and receive the response
  request(options, function(err, response, body) {
    if (err) return callback(err);

    if (response.statusCode != "200")
    throw ("response code from " + url + " was not 200.  Received " + res.statusCode + " " + res.statusMessage);

    console.log("GOT CONTACTS OK " + body);

    callback(null,body);

  })

}

function convertContact(XML,callback){

  console.log('converting ' + XML);

  var convert = require('./converter.js');

  var aXML = [];
  aXML.push(XML)
  convert(aXML, function(err,response) {

    if (err) return error(err);

    callback(null,response);
  });

}

function submitContact(parsedXML,callback){

  console.log("submitting " + parsedXML);

  var url =  'https://www.google.com/m8/feeds/contacts/' + targetGoogleUser + '/full/';

  var options =
  {
    method: "POST",
    gzip: true,
    headers:  {'Authorization': "Bearer " + targetToken,
              'Content-Type': 'application/atom+xml',
              'GData-Version': '3.0'},
    body:parsedXML,
    url: url
  }

  request(options, function(err, res, body) {

    if (err){throw err;}

    if (res.statusCode != "201")
        throw ("response code was not 201 (created).  Received " + res.statusCode + " " + res.statusMessage);

    console.log("got response " + res.statusCode + ":" + res.statusMessage)

    console.log("CONTACT CREATED.  " + body);

    callback(null);

  });

}
