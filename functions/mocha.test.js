const assert = require('assert');

const fb = require('./firebase');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const accountIds = [
  "mochaTestAccountVNDAdd",
  "mochaTestAccountBid",
  "mochaTestAccountASK",
  "mochaTestAccountFokBid",
  "mochaTestAccountFokASK",
];
const accountInfo = {
  book: {
    SVT: 10,
  },
  wallet: {
    VND: 10,
    ETH: 10,
  }
};

const VNDAdd = {
  user: accountIds[0],
  kind: 'wallet',
  currency: 'VND',
  action: 'add',
  amount: 1,
  status: 'pending',
  created: Date.now(),
};

const SVTBid = {
  action: 'bid',
  amount: 1,
  currency: 'VND',
  kind: 'book',
  price: 1,
  status: 'pending',
  symbol: 'SVT',
  user: accountIds[1],
  created: Date.now(),
};

const SVTAsk = {
  action: 'ask',
  amount: 1,
  currency: 'VND',
  kind: 'book',
  price: 1,
  status: 'pending',
  symbol: 'SVT',
  user: accountIds[2],
  created: Date.now(),
};

const SVTFokBid = {
  ...SVTBid,
  user: accountIds[3]
};

const SVTFokAsk = {
  ...SVTAsk,
  user: accountIds[4]
};

describe("Basic database test. No background process needed.", () => {
  it(`Create ${accountIds.length} new accounts.`, async () => {
    let succeed = 0;
    for (const accountId of accountIds) {
      await fb.database().ref('/account').child(accountId).set(accountInfo).then(() => {
        succeed++;
      }).catch((error) => {
        console.log('onrejected', error);
      });
    }
    assert.equal(succeed, accountIds.length, "Database set operation has failed!")
  }).timeout(10000);
  it("Topup VND account with 1 VND.", async () => {
    let succeed = false;
    await fb.database().ref('/queue').push(VNDAdd).then(() => {
      succeed = true;
    }).catch((error) => {
      console.log('onrejected', error);
    });
    assert.equal(succeed, true, "Database push operation has failed!")
  });
  it("Place buying offer.", async () => {
    let succeed = 0;
    await fb.database().ref('/queue').push(SVTBid).then(() => {
      succeed++;
    }).catch((error) => {
      console.log('onrejected', error);
    });
    assert.equal(succeed, 1, "Database push operation has failed!")
  });
  it("Place selling offer.", async () => {
    let succeed = 0;
    await fb.database().ref('/queue').push(SVTAsk).then(() => {
      succeed++;
    }).catch((error) => {
      console.log('onrejected', error);
    });
    assert.equal(succeed, 1, "Database push operation has failed!");
  });
});

describe("Basic trading test. Expects running background functions.", () => {
  it("Wait 5 seconds for the messages to become consumed . .", async function () {
  });
  it(". . .", async function () {
    await sleep(5000);
  }).timeout(10000);
  it("Accept bid", async function () {
    let bid = null;
    await fb.database().ref('/bids').once('value', (snapshot) => {
      const res = snapshot.val();
      //console.log(res);
      if (res !== null) {
        for (let key in res) {
         // if (res[key].bidder === SVTBid.user && res[key].created === SVTBid.created) {
          if (res[key].bidder === SVTBid.user) {
            bid = {ref: key, ...res[key]};
          }
        }
      }
    });
    if (bid === null) {
      assert.fail("Missing acceptable bid!")
    } else {
      const fokAsk = {...bid, action:'fokAsk', user: SVTFokBid.user, status:'pending', king:'book'};
      delete fokAsk.bidder;
      let succeed = 0;
      await fb.database().ref('/queue').push(fokAsk).then(() => {
        succeed++;
      }).catch((error) => {
        console.log('onrejected', error);
      });
      assert.equal(succeed, 1, "Database push operation has failed!");
    }
  }).timeout(10000);
  it("Accept ask", async function () {
    let ask = null;
    await fb.database().ref('/asks').once('value', (snapshot) => {
      const res = snapshot.val();
      if (res !== null) {
        for (let key in res) {
          // if (res[key].seller === SVTAsk.user && res[key].created === SVTAsk.created) {
          if (res[key].seller === SVTAsk.user) {
            ask = {ref: key, ...res[key]};
          }
        }
      }
    });
    if (ask === null) {
      assert.fail("Missing acceptable ask.")
    } else {
      const fokAsk = {...ask, action:'fokBid', user: SVTFokAsk.user, status:'pending', king:'book'};
      delete fokAsk.seller;
      let succeed = 0;
      await fb.database().ref('/queue').push(fokAsk).then(() => {
        succeed++;
      }).catch((error) => {
        console.log('onrejected', error);
      });
      assert.equal(succeed, 1, "Database push operation has failed");
    }
  }).timeout(10000);
});

describe("Checking results of the background processes functions.", () => {
  it("Wait 5 seconds for the messages to become consumed . .", async function () {
  });
  it(". . .", async function () {
    await sleep(5000);
  }).timeout(10000);
});


describe("Canceling offers and cleaning up..", () => {
  it("Close database connection", async () => {
    fb.database().goOffline();
  });
});