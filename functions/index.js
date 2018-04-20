const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.handleTransaction = functions.database.ref('/transactions/{transID}').onCreate((transaction) => {

  let data = transaction.val();
  let key = transaction.key;

  if(data.type == "send") {

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
          requests: {},
          transactions: {}
        }
        user.transactions[key] = data.timestamp;

      }
      return user;

    });

  } else if(data.type == "request") {

    admin.database().ref('accounts/' + data.receiver).transaction(function(user) {

      if (user) {

        if(!user.requests) {
          user.requests = {};
        }
        user.requests[key] = data.timestamp;

      } else {

        user = {
          balance: 0,
          requests: {},
          transactions: {}
        }
        user.requests[key] = data.timestamp;

      }
      return user;

    });

  } else if(data.type == "cert") {

    admin.database().ref('certs/' + data.receiver).once('value', (cert) => {

      if(cert.exists()) {

        admin.database().ref('accounts/' + data.sender).transaction(function(user) {

          if (user) {

            user.balance += cert.val();
            user.transactions[key] = data.timestamp;

          } else {

            user = {
              balance: 0,
              requests: {},
              transactions: {}
            }
            user.transactions[key] = data.timestamp;

          }
          return user;

        }, (e, success, snap) => {
          if(success) {
            admin.database().ref('certs/' + data.receiver).remove();
          }
        });

      }

    });

  }

  return true;

});
