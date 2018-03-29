const functions = require('firebase-functions');
const SquareConnect = require('square-connect');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  (SquareConnect.ApiClient.instance)
    .authentications["oauth2"]
    .accessToken = functions.config().square.prod.access_token;

  const catalogApi = new SquareConnect.CatalogApi();

  catalogApi.listCatalog().then((catalog)=>{
    console.log(catalog);
    response.send(catalog.objects);
    return;
  }).catch((error)=>{
    console.log(error);
    response.send(error);
  });

  //response.send("Hello from Firebase!");
});
