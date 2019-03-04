const firebase = require('firebase');

const UserRequestConsumer = require('./consumers/user-request');
const userRequestConsumer = new UserRequestConsumer();

// Initialize Firebase

const fb = firebase.initializeApp({
  * replace * me *
  console.firebase.google.com Develop > Authentication > Web setup
});

console.log(fb.name);
queueRef = fb.database().ref('/queue');

queueRef.on('child_added', (snapshot) => {
  // consumers.log(snapshot);
  userRequestConsumer.proceed(snapshot);
});

// fb.database().ref('/bids/SVT').orderByChild('amount').equalTo('30').on('child_added', (snapshot) => {
//   consumers.log(snapshot);
//   // consumers.proceed(snapshot);
// });

//
// fb.database().ref('messages').push({
//   original: 'bello '+ Date.now()
// });
