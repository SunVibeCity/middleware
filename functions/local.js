const firebase = require('firebase');

const Consumers = require('./consumers');
const consumers = new Consumers();

// Initialize Firebase

const fb = firebase.initializeApp({
 * * *
});

console.log(fb.name);
queueRef = fb.database().ref('/queue');

queueRef.on('child_added', (snapshot, prevChildKey) => {
  // consumers.log(snapshot);
  consumers.proceed(snapshot);
});


//
// fb.database().ref('messages').push({
//   original: 'bello '+ Date.now()
// });
