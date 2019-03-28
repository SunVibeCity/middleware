const fb = require('./firebase');

const UserRequestConsumer = require('./consumers/user-request');
const userRequestConsumer = new UserRequestConsumer();
const AskConsumer = require('./consumers/ask');
const askConsumer = new AskConsumer();
const BidConsumer = require('./consumers/bid');
const bidConsumer = new BidConsumer();


console.log(fb.name);

fb.database().ref('/queue').on('child_added', (snapshot) => {
  // userRequestConsumer.log(snapshot);
  userRequestConsumer.proceed(snapshot);
});

fb.database().ref('/asks').on('child_added', (snapshot) => {
  // askConsumer.log(snapshot);
  askConsumer.proceed(snapshot);
});

fb.database().ref('/bids').on('child_added', (snapshot) => {
  // bidConsumer.log(snapshot);
  bidConsumer.proceed(snapshot);
});
