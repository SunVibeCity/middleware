const firebase = require('firebase');


class Consumers  {

  log(snapshot) {
    console.log(snapshot.key, snapshot.val());
  }

  /**
   * @var snapshot
    */
  proceed(snapshot) {
    // console.log(snapshot.ref.path);
    const ref = snapshot.ref;
    const content = snapshot.val();
    const {action, kind, status, symbol, user, userke} = content;
    const key = snapshot.key;
    console.log(`Message ${key} is processing.. `);

    if (status === 'pending') {
      const expression = symbol + action[0].toUpperCase() + action.substring(1);
      // console.log(expression);

      if (userke === undefined) {
        console.log("\tConsuming error, user is undefined", content);
        content.status = 'error';
        content.error = "Consuming error, user is undefined."
        ref.update(content).then((result) => {
          console.log(result);
        });
        return;
      }

      switch(expression) {
        case 'SVTFokBid':
          ref.parent.parent.child('activity').child(user);
          break;
        default:
          console.log("\tConsuming error: Not implemented yet.");
      }
    } else if (status === 'error') {
      console.log("\tIgnored due to error status");
    } else {
      console.log("\tConsuming error, unknown status of", content);
    }

  }

}
//module.exports.log = log;
module.exports = Consumers;