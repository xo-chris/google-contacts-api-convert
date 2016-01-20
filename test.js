//test that our module works OK, this code has _not_ been use or tested,
//provided to show a basic concept and some sample code to look at if it helps


var id = '123abc'; //google contact id
var token = 'secret'; //replace with valid auth token
var userEmail = 'me@mydomain.com' //user email
var url = "https://www.google.com/m8/feeds/contacts/" + userEmail + "/full/" + id +  "?alt=json";

var request = require('request'); //use third party 'request' node module

//options to pass to our request
var options =
{
  method: "GET",
  gzip: true,
  headers:  {'Authorization': "Bearer " + token,
     'GData-Version': '3.0'}, //use version 3 of the API
  url: url
}

//GET request to obtian contact data - which will be in JSON format

request(options, function(err, res, body) {

  if (err){throw err;}

  if (res.statusCode != 200)
      throw ("Server returns error: " + res.statusMessage);

  var googleContactJsonString = body; //json contact response from google will be in the body returned

  //.....make changes to contact as desired.....

  //use our new functionality to get ATOM XML to submit
  var myConvert = require('google-contacts-api-convert'); //so this is the new module we are writing
  myConvert.googleContactJsonToAtomXML(true,googleContactJsonString), function (error, myAtom) {

    //so now we have the ATOM XML we need to create a new google contact - eturned in myAtom variables
    //we can now make the POST request to create a new google contact using ATOM XML returned from our new module
   var url = "https://www.google.com/m8/feeds/contacts/" + userEmail + "/full/" + id;
   var options =
   {
     method: "POST", //POST request creates a new contact - PUT would update an existing contact
     gzip: true,
     headers:  {'Authorization': "Bearer " + token,
        'GData-Version': '3.0'}, //use version 3 of the API
     url: url,
     body:myAtom,//so we are using the XML returned from our new function to POST in the body
   }

   //fire away!
   request(options, function(err, res, body) {

      if (err){throw err;}

      if (res.statusCode != '200')
          throw ("Server returns error: " + res.statusMessage);

      console.log("New contact created :-)");

      console.log(body); //body will contain the google server response, including the id of the newly created contact

     })

  }

})
