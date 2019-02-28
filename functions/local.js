const firebase = require('firebase');

const Consumers = require('./consumers');
const consumers = new Consumers();

// Initialize Firebase

const fb = firebase.initializeApp({
  * replace * me *
  console.firebase.google.com Develop > Authentication > Web setup
});

console.log(fb.name);
queueRef = fb.database().ref('/queue');

queueRef.on('child_added', (snapshot) => {
  // consumers.log(snapshot);
  consumers.proceed(snapshot);
});


//
// fb.database().ref('messages').push({
//   original: 'bello '+ Date.now()
// });
