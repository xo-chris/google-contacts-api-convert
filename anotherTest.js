//download a single contact, convert the XML and submit to the google api

var request = require("request");
var xml2js = require('xml2js');
var async = require("async");

//global variables
var maxContactsPerRequest = 1;
var q = "chris@exosphereapps.com";
var googleUser = "chris@exosphereapps.com";

var token = "ya29.egKoXccp5pKj1F7WflGgWExpHYuTMJkiWDuXIimtWkJ5YLGt1z6059I51EH4JDeqRmd14XIRAh4JsF-MVYeV7b5KAlxKt0LmTUkM-SRRSHSADXvfAP0";



async.waterfall([
  getContact,
  convertContact,
  submitContact
],
// this gets called at the end
function( err){
  if (err) throw err;
});


function getContact(callback){

  console.log('getting contact');
  var url =  'https://www.google.com/m8/feeds/contacts/' + googleUser + '/full/?alt=atom&max-results='+maxContactsPerRequest+'&q=' + q;

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

  var url =  'https://www.google.com/m8/feeds/contacts/' + googleUser + '/full/';

  var options =
  {
    method: "POST",
    gzip: true,
    headers:  {'Authorization': "Bearer " + token,
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

