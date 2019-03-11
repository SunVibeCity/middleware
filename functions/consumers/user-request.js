
class UserRequestConsumer  {

  /**
   * @var snapshot firebase.database.DataSnapshot
   */
  log(snapshot) {
    console.log(snapshot.key, snapshot.val());
  }

  /**
   * @var snapshot firebase.database.DataSnapshot
   * @var append object what will be merged to user activity log
   */
  _addUserActivity(snapshot, append) {
    const ref = snapshot.ref;
    const content = snapshot.val();
    const activity = Object.assign({}, content, append);
    activity.created = Date.now();
    delete activity.user;
    //console.log('activity:', activity);
    return ref.parent.parent.child('activity').child(content.user).push(activity, (error) => {
      if (error) {
        console.error('User activity logging failed abnormally!', error);
      }
    });
  }


  /**
   * @var snapshot firebase.database.DataSnapshot
   */
  _actionVNDAdd(snapshot) {
    const ref = snapshot.ref;
    const {amount, currency, user} = snapshot.val();
    return ref.parent.parent.child('account').child(user).once( 'value', (userSnp) => {
      const userInfo = userSnp.val();
      // console.log(userInfo);
      // console.log(snapshot.val());
      this._addUserActivity(snapshot, {status:'Done'}).then( () => {
        userInfo.wallet[currency] = Number(userInfo.wallet[currency]) + Number(amount);
        ref.parent.parent.child('account').child(user).update(userInfo).catch((reason) => {
          console.error("User update has failed!", reason, userInfo);
        });
        ref.remove().catch((reason) => {
          console.error("Remove message has failed!", reason);
        });
      });
    }).catch((reason) => {
      console.error("User has not found!", reason);
    });
  }

  /**
   * Adds buying offer to marketplace.
   * Arranges data in database, but do not handles or triggers trading transaction.
   * @var snapshot firebase.database.DataSnapshot
   */
  _actionSVTBid(snapshot) {
    const ref = snapshot.ref;
    const {amount, currency, symbol, price, user} = snapshot.val();
    return ref.parent.parent.child('account').child(user).once( 'value', (userSnp) => {
      const userInfo = userSnp.val();
      // console.log(userInfo);
      // console.log(snapshot.val());
      let error = null;
      if (userInfo === null) {
        console.error("User has not found!", snapshot.val());
        return ref.update({status:'error', error:"User has not found!"}).catch((reason) => {
          console.error("Message update has failed!", reason, snapshot.val());
        });
      }
      if (userInfo.wallet === null || userInfo.wallet[currency] === null) {
        error = "User's wallet has not found";
      }
      if (Number(amount) <= 0) {
        error = "Amount must be more than 0!";
      }
      if (Number(amount) * Number(price) > Number(userInfo.wallet[currency])) {
        error = "Insufficient found!";
      }
      if (error !== null) {
        // console.error(`\t${error}`, userInfo, snapshot.val());
        this._addUserActivity(snapshot, {status:'error', error: error}).then( () => {
          ref.remove().catch((reason) => {
            console.error("Remove message has failed!", reason);
          });
        });
      } else {
        ref.parent.parent.child('bids').push({
          bidder: user,
          price: price,
          amount: amount,
          currency: currency,
          symbol: symbol,
          status: 'open',
          created: Date.now()
        }, (error) => {
          if (error) {
            console.error("Bid creation failed abnormally!", error);
          } else {
            this._addUserActivity(snapshot, {status:'open'}).then( () => {
              ref.parent.parent.child(`account/${user}/wallet/${currency}`).transaction(
                (walletAmount) => {
                  return Number(walletAmount) - Number(amount) * Number(price);
                }, (error) => {
                  if (error) {
                    console.error("Transaction failed abnormally!", error);
                  } else {
                    ref.remove().catch((reason) => {
                      console.error("Remove message has failed!", reason);
                    });
                  }
                }
              );
            });
          }
        });
      }
    }).catch((reason) => {
      console.error("User has not found!", reason);
    });
  }

  /**
   * Adds selling offer to marketplace.
   * Arranges data in database, but do not handles or triggers trading transaction.
   * @var snapshot firebase.database.DataSnapshot
   */
  _actionSVTAsk(snapshot) {
    const ref = snapshot.ref;
    const {amount, currency, symbol, price, user} = snapshot.val();
    return ref.parent.parent.child('account').child(user).once( 'value', (userSnp) => {
      const userInfo = userSnp.val();
      console.log(userInfo);
      console.log(snapshot.val());
      let error = null;
      if (userInfo === null) {
        console.error("User has not found!", snapshot.val());
        return ref.update({status:'error', error:"User has not found!"}).catch((reason) => {
          console.error("Message update has failed!", reason, snapshot.val());
        });
      }
      if (userInfo.book === null || userInfo.book[symbol] === null) {
        error = "User's book has not found!";
      }
      if (Number(amount) <= 0) {
        error = "Amount must be more than 0!";
      }
      if (Number(amount) > Number(userInfo.book[symbol])) {
        error = "Insufficient shares!";
      }
      if (error !== null) {
        // console.error(`\t${error}`, userInfo, snapshot.val());
        this._addUserActivity(snapshot, {status:'error', error: error}).then( () => {
          ref.remove().catch((reason) => {
            console.error("Remove message has failed!", reason);
          });
        });
      } else {
        ref.parent.parent.child('asks').push({
          seller: user,
          price: price,
          amount: amount,
          currency: currency,
          symbol: symbol,
          status: 'open',
          created: Date.now()
        }, (error) => {
          if (error) {
            console.error('Ask creation failed abnormally!', error);
          } else {
            this._addUserActivity(snapshot, {status:'open'}).then( () => {
              ref.parent.parent.child(`account/${user}/book/${symbol}`).transaction(
                (bookAmount) => {
                  return Number(bookAmount) - Number(amount);
                }, (error) => {
                  if (error) {
                    console.error('Transaction failed abnormally!', error);
                  } else {
                    ref.remove().catch((reason) => {
                      console.error("Remove message has failed!", reason);
                    });
                  }
                }
              );
            });
          }
        });
      }
    }).catch((reason) => {
      console.error("User has not found!", reason);
    });
  }

  /**
   * @var snapshot firebase.database.DataSnapshot
    */
  proceed(snapshot) {
    // console.log(snapshot.ref.path);
    const ref = snapshot.ref;
    const content = snapshot.val();
    const {action, status, symbol, user} = content;
    const key = snapshot.key;
    console.log(`Message ${key} is processing.. `);

    if (status === 'pending') {
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
        case 'SVTBid':
        case 'SVTFokBid':
          return this._actionSVTBid(snapshot);
        case 'VNDAdd':
        case 'VNDFokAdd':
          return this._actionVNDAdd(snapshot);
        case 'SVTAsk':
          return this._actionSVTAsk(snapshot);
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

module.exports = UserRequestConsumer;
