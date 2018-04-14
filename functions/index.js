const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.handleTransaction = functions.database.ref('/transactions/{transID}').onCreate((transaction) => {

  let data = transaction.val();
  let key = transaction.key;

  admin.database().ref('accounts/' + data.sender).transaction(function(user) {

    if (user) {

      user.balance -= data.amount;
      if(!user.transactions) {
        user.transactions = {};
      }
      user.transactions[key] = data.timestamp;

    }
    return user;

  });

  admin.database().ref('accounts/' + data.receiver).transaction(function(user) {

    if (user) {

      user.balance += data.amount;

      if(!user.transactions) {
        user.transactions = {};
      }
      user.transactions[key] = data.timestamp;

    } else {

      user = {
        balance: data.amount,
        transactions: {}
      }
      user.transactions[key] = data.timestamp;

    }
    return user;

  });

  return true;

});
