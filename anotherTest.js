
//modules required to run tests
var request = require("request");
var async = require("async");
var xml2js = require('xml2js');

//global variables
var maxContacts = 1000; //maximum contacts to update.  Set to a very large number like 999999 to update all contacts
var isUpdate = false;

//set the google user and target user and their tokens to test

var googleUser = "me@gmail.com"; //copy contacts from this user
var token = "";//oAuth token, you can get this from somewhere like Google oAuth Playground

var targetGoogleUser = "someoneelse@gmail.com"; //copy contacts to this user
var targetToken = '';

testContacts("",false); //add all contacts from googleUser to contacts of targetGoogleUser;

//some other tests that can be runn
//testContacts("sync_me",false); //add all contacts with 'sync_me' in any field
//testContacts("sync_me",true); //update all contacts with 'sync_me' in any field (modify the contact note)

function testContacts(query,isAnUpdate){

  if (isAnUpdate){
    isUpdate = true;
    googleUser = targetGoogleUser;
    token = targetToken;
  }

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

  console.log('getting contacts...');
  var url =  'https://www.google.com/m8/feeds/contacts/' + googleUser + '/full/?alt=atom&max-results='+maxContacts + '&q=' + query;
  console.log(url);
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

  if (isUpdate)
    convertContactForEdit(XML,callback);
  else {
    convertContactForAdd(XML,callback);
  }

}

function convertContactForAdd(XML,callback){

  //call convert function
  var convert = require('./converter.js');

  convert(XML, function(err,response) {

    if (err) throw err;

    callback(null,response);
  });

}

function convertContactForEdit(XML,callback){

  //make a small change to the contact notes so we can tell this was edited
	xml2js.parseString(XML, function(err, json) {

    for (var i=0;i<json.feed.entry.length;i++){

        var note =  (json.feed.entry[i].content ===undefined)?"": json.feed.entry[i].content;
        note += " MODIFIED BY TEST";
        json.feed.entry[i].content  = note;
    }

    var builder = new xml2js.Builder();
    XML = builder.buildObject(json);

    var convert = require('./converter.js');

    convert(XML, false,function(err,response) {

      if (err) return error(err);

      callback(null,response);
    });

  });


}

function submitContact(parsedXMLs,callback){

  //console.log("submitting " + parsedXML);

  //our 'convert' function has returned an array of ATOM XML to submit to the server
  //iterate through this array submitting batch changes to the server
  async.eachSeries(parsedXMLs, function(parsedXML, next) {
    var url =  'https://www.google.com/m8/feeds/contacts/' + targetGoogleUser + '/full/batch/';

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

      if (err)return next(err);

      if (res.statusCode != "200")
          return next ("response code was not 200 (OK).  Received " + res.statusCode + " " + res.statusMessage);

      console.log("Contact batch submitted.  Server response: " + res.statusCode + ":" + res.statusMessage)

      //console.log("CONTACT CREATED.  " + body);

      next(null);

    });
  }, function(err) {
    if (err) throw err;
      console.log('FINISHED everything!');
  });

}
