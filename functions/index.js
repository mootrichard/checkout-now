const functions = require('firebase-functions');
const admin = require('firebase-admin');
const SquareConnect = require('square-connect');
const crypto = require('crypto');
const axios = require('axios');
const serviceAccount = require("./service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: functions.config().firebase.databaseURL
});

function createFirebaseAccount(id, squareEmail, displayName, accessToken) {
  // The UID we'll assign to the user.
  const uid = `square:${id}`;

  // Save the access token tot he Firebase Realtime Database.
  const databaseTask = admin.database().ref(`/squareAccessToken/${uid}`)
    .set(accessToken);

  // Create or update the user account.
  const userCreationTask = admin.auth().updateUser(uid, {
    displayName: displayName,
    email: squareEmail
  }).catch(error => {
    // If user does not exists we create it.
    if (error.code === 'auth/user-not-found') {
      return admin.auth().createUser({
        uid: uid,
        displayName: displayName,
        email: squareEmail
      });
    }
    throw error;
  });

  // Wait for all async task to complete then generate and return a custom auth token.
  return Promise.all([userCreationTask, databaseTask]).then(() => {
    // Create a Firebase custom auth token.
    const token = admin.auth().createCustomToken(uid);
    console.log('Created Custom token for UID "', uid, '" Token:', token);
    return token;
  });
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.catalog = functions.https.onRequest((request, response) => {
  admin.auth().verifyIdToken(request.body.idToken)
    .then((decodedToken) => {
      var uid = decodedToken.uid;
      var squareToken = admin.database().ref(`/squareAccessToken/${uid}`).once('value').then((userToken) => {

        (SquareConnect.ApiClient.instance)
        .authentications["oauth2"]
          .accessToken = userToken.val();

        const catalogApi = new SquareConnect.CatalogApi();

        catalogApi.listCatalog().then((catalog) => {
          console.log(catalog);
          response.send(catalog.objects);
          return;
        }).catch((error) => {
          console.log(error);
          response.send(error);
        });

        return;
      }).catch(error => console.log(error));
      return;
    }).catch( (error) => {
      // Handle error
      response.send(error);
      return;
    });

});

exports.authorize = functions.https.onRequest((request, response) => {
  const squareAuthURL = "https://connect.squareup.com/oauth2/authorize?";
  const state = (crypto.randomBytes(32)).toString('hex');
  response.set('Set-Cookie', `__session=${state}; Secure`);

  response.redirect(
    squareAuthURL +
    `client_id=${functions.config().square.prod.app_id}&` +
    `response_type=code&` +
    `scope=MERCHANT_PROFILE_READ PAYMENTS_WRITE ORDERS_WRITE ITEMS_READ&` +
    `session=false&` +
    `locale=en-US&` +
    `state=${state}`
  );
});

exports.callback = functions.https.onRequest((request, response) => {
  const tokenURL = "https://connect.squareup.com/oauth2/token";
  const redirectURI = "https://checkout-now.firebaseapp.com/callback";
  let cookieState = request.get('cookie').slice(10);

  if (cookieState === request.query.state) {
    axios.post(tokenURL, {
        client_id: functions.config().square.prod.app_id,
        client_secret: functions.config().square.prod.secret,
        code: decodeURIComponent(request.query.code),
        redirect_uri: redirectURI
      })
      .then((token) => {
        return (
          axios.get("https://connect.squareup.com/v1/me", {
            "headers": {
              "Authorization": `Bearer ${token.data.access_token}`
            }
          })
          .then((user) => {
            createFirebaseAccount(user.data.id,
                                  user.data.email,
                                  user.data.name,
                                  token.data.access_token)
              .then(firebaseToken => {
                // Serve an HTML page that signs the user in and updates the user profile.
                  response.send(signInFirebaseTemplate(firebaseToken, user.data.email));
                  return;
              })
              .catch(error => {
                console.log(error);
                response.send(error);
              })
            return;
          })
          .catch(error => {
            console.log(error)
            response.send(error);
          })
        )
      })
      .catch(error => {
        console.log(error)
        response.send(error);
      });
  } else {
    response.send(`${cookieState} === ${request.query.state}`);
  }
});

/**
 * Generates the HTML template that signs the user in Firebase using the given token and closes the
 * popup.
 */
function signInFirebaseTemplate(token, email) {
  return `
    <script src="https://www.gstatic.com/firebasejs/4.12.0/firebase.js"></script>
    <script>
      // var token = '${token}';
      var config = {
        apiKey: '${functions.config().firebase.apiKey}'
      };
      var app = firebase.initializeApp(config);
      var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this URL
        // must be whitelisted in the Firebase Console.
        'url': "https://checkout-now.firebaseapp.com/", // Here we redirect back to this same page.
        'handleCodeInApp': true // This must be true.
        };
      firebase.auth().sendSignInLinkToEmail("${email}", actionCodeSettings).then(function() {
        // Save the email locally so you don’t need to ask the user for it again if they open
        // the link on the same device.
        window.localStorage.setItem('emailForSignIn', "${email}");
        // The link was successfully sent. Inform the user.
        alert('An email was sent to ' + "${email}" + '. Please use the link in the email to sign-in.');
        window.close();
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        console.log(error);
        // [END_EXCLUDE]
      });
    </script>`;
}
