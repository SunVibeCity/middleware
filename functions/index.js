

const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const Consumers = require('./consumers');
const consumers = new Consumers();

exports.helloWorld = functions.region('asia-northeast1').https.onRequest((req, res) => {
 res.send("Hello from Firebase!");
});


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
// exports.addMessage = functions.https.onRequest((req, res) => {
//  // Grab the text parameter.
//  const original = req.query.text;
//  // Push the new message into the Realtime Database using the Firebase Admin SDK.
//  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
//   res.send(original);
//  });
// });


// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.consumer = functions.region('asia-northeast1').database.ref('/queue/{pushId}')
  .onCreate((snapshot, context) => {
    return consumers.proceed(snapshot);
  });
