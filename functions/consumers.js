const firebase = require('firebase');


class Consumers  {

  /**
   * @var snapshot firebase.database.DataSnapshot
   */
  log(snapshot) {
    console.log(snapshot.key, snapshot.val());
  }

  /**
   * @var snapshot firebase.database.DataSnapshot
   */
  _addUserActivity(snapshot) {
    const ref = snapshot.ref;
    const content = snapshot.val();
    const activity = Object.assign({}, content);
    activity.created = Date.now();
    delete activity.user;
    delete activity.status;
    console.log('activity:', activity);
    return ref.parent.parent.child('activity').child(content.user).push(activity);
  }

  /**
   * @var snapshot firebase.database.DataSnapshot
    */
  proceed(snapshot) {
    // console.log(snapshot.ref.path);
    const ref = snapshot.ref;
    const content = snapshot.val();
    const {action, kind, status, symbol, user} = content;
    const key = snapshot.key;
    console.log(`Message ${key} is processing.. `);

    if (status === 'pending') {
      const expression = symbol + action[0].toUpperCase() + action.substring(1);
      // console.log(expression);

      if (user === undefined) {
        console.error("\tConsuming error, user is undefined", content);
        content.status = 'error';
        content.error = "Consuming error, user is undefined."
        return ref.update(content).then((result) => {
          console.log(result);
        });
      }

      switch(expression) {
        case 'SVTFokBid':
          return this._addUserActivity(snapshot).then( () => {
              ref.remove().then( () => {
                console.log("\tSVTFokBid consumed.");
              });
            }
          );
        default:
          console.log("\tConsuming error: Not implemented yet.");
      }
    } else if (status === 'error') {
      console.log("\tIgnored due to error status");
    } else {
      console.error("\tConsuming error, unknown status of", content);
    }

  }

}
//module.exports.log = log;
module.exports = Consumers;