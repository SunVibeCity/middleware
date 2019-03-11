
class BidConsumer  {

  /**
   * @var snapshot firebase.database.DataSnapshot
   */
  log(snapshot) {
    console.log(snapshot.key, snapshot.val());
  }

  /**
   * @var snapshot firebase.database.DataSnapshot
    */
  proceed(snapshot) {
    console.log(snapshot.ref.path);
    const ref = snapshot.ref;
    const content = snapshot.val();
    const {action, status, symbol, user} = content;
    const key = snapshot.key;
    console.log(`Message ${key} is processing.. `);

    if (status === 'open') {
      const expression = symbol + action[0].toUpperCase() + action.substring(1);
      if (user === undefined) {
        console.error("\tConsuming error, user is undefined", content);
        content.status = 'error';
        content.error = "Consuming error, user is undefined.";
        return ref.update(content).then((result) => {
          console.log(result);
        }).catch((reason) => {
          console.error("Message update has failed!", reason, content);
        });
      }
      switch(expression) {
        default:
          console.warn(`\tConsuming error ${key}: ${expression} has not implemented yet.`);
      }
    } else if (status === 'error') {
      console.log("\tIgnored due to error status");
    } else {
      console.error("\tConsuming error, unknown status of", content);
    }
    return false;
  }

}

module.exports = BidConsumer;
