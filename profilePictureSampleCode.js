
/*
This module should GET a photo from a google contact and PUT this photo into another google contact's photo

Currently the PUT request returns a 400 'Bad Request' error, with the message 'Invalid Image File'

*/


//modules required to run tests
var request = require("request");
var async = require("async");
var xml2js = require('xml2js');


//set the google user and target user and their tokens

var googleUser = "chris@exosphereapps.com"; //copy contacts from this user
var token = "";//oAuth token, you can get this from somewhere like Google oAuth Playground

var targetGoogleUser = "fred@exosphereapps.com"; //copy contacts to this user
var targetToken = "";

var contactId = '3079175788e63b45'; //the googleID of the contact with a photo
var targetContactId = '6b8c193e8e334f43'; //the google ID of the contact to whom the photo will be added



testContacts();



function testContacts(){

  async.waterfall([
    getContact,//this all works fine - just an example of getting photo related properties
    getPhoto,//get the photo bytes by calling the photo url
    savePhotoToAnother //save the photo bytes to anohter contact.  Returns 400 error currently :-(
  ],
  // this gets called at the end
  function( err){
    if (err) throw err;
  });
}


function savePhotoToAnother(photoBytes,callback){

    console.log('saving photo');

    var url =  'https://www.google.com/m8/feeds/photos/media/' + targetGoogleUser + '/' + targetContactId;

    console.log('PUT to URL ' + url);
    console.log('bytes' + photoBytes);

    var options =
    {
      method: "PUT",
      gzip: true,
      headers:  {'Authorization': "Bearer " + targetToken,
                'GData-Version': '3.0',
                'If-match': '*',
                'Content-Type': 'image/*'
              },
      body:photoBytes,
      url: url
    }

    request(options, function(err, res, body) {

      if (err)throw err;

    //  if (res.statusCode != "200")
      //    return next ("response code was not 200 (OK).  Received " + res.statusCode + " " + res.statusMessage + " " + body);

      console.log("Contact batch submitted.  Server response: " + res.statusCode + ":" + res.statusMessage)

      console.log("PHOTO CREATED.  " + body);

    });


}


function getPhoto(contact,callback){

console.log('getting photo...');

var url =  'https://www.google.com/m8/feeds/photos/media/' + googleUser + "/" + contactId;

var options = {
  url: url,
  headers: {
    'Gdata-version': 3,
    'Content-Type': 'image/*',
    'Authorization': 'Bearer '+token
  }
};


// do the request and receive the response
request(options, function(err, response, body) {

  if (err) return callback(err);

  if (response.statusCode != "200")
  throw ("response code from " + url + " was not 200.  Received " + response.statusCode + " " + response.statusMessage + " " + body);

 console.log("GOT PHOTO OK ");// + body);

 callback(null,body);
});

}

function getContact(callback){

  console.log('getting contacts...');

  var url =  'https://www.google.com/m8/feeds/contacts/' + googleUser + "/full/" + contactId + "/?alt=atom";

  var options = {
    url: url,
    headers: {
      'Gdata-version': 3,
      'Authorization': 'Bearer '+token
    }
  };

  // do the request and receive the response
  request(options, function(err, response, body) {
      if (err) return callback(err);

      if (response.statusCode != "200")
      throw ("response code from " + url + " was not 200.  Received " + response.statusCode + " " + response.statusMessage + " " + body);

     console.log("GOT CONTACTS OK " + body);

     xml2js.parseString(body, function(err, result) {

      var contact = result.entry;

      var imageType;
      var imageUrl;
      var image_eTag;

     console.log( "len " +  contact['link'].length);
     for (var i = 0;i<contact['link'].length;i++){


       if (contact['link'][i]['$'].type.toString().substring(0,5) == "image"){
         imageType = contact['link'][i]['$'].type.toString();
         imageUrl  = contact['link'][i]['$'].href.toString();
         image_eTag  = contact['link'][i]['$']['gd:etag'].toString()
         break;
       }
     }

     console.log("imageType is " + imageType);
     console.log("imageUrl is " + imageUrl);
     console.log("image etag is " + image_eTag);

     callback(null,contact);

  });


  })

}
