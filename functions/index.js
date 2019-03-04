

const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const UserRequestConsumer = require('./consumers/user-request');
const userRequestConsumer = new UserRequestConsumer();

exports.helloWorld = functions.region('asia-northeast1').https.onRequest((req, res) => {
 res.send("Hello from Firebase!");
});


// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.consumer = functions.region('asia-northeast1').database.ref('/queue/{pushId}')
  .onCreate((snapshot) => {
    return userRequestConsumer.proceed(snapshot);
  });
