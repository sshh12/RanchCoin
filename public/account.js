
class Account {

  constructor() {

    let balanceRef = db.ref(`accounts/${auth.uid}/balance`);
    balanceRef.on('value', this.onBalance);

    let transactionRef = db.ref(`accounts/${auth.uid}/transactions`);
    transactionRef.on('value', this.onTransactions);

  }

  onBalance(data) {
    let balance = data.val() || 0.00;
    $('#cur-balance').html(balance.toFixed(2) + ' RC');
    account.balance = balance;
  }

  onTransactions(data) {

    let transactions = data.val();

    if(transactions !== null) {
      $('#transaction-list').html("");
    }

    transactions = reverseObj(transactions);

    for(let key in transactions) {
      db.ref(`transactions/${key}`).on('value', function(d) {
        let transData = d.val();
        if(transData.sender === auth.uid) {
          $('#transaction-list').append(`<li class="list-group-item">To <b>${transData.receiverName}</b> <span class="trans-amt badge badge-danger">-${transData.amount.toFixed(2)}</span></li>`);
        } else {
          $('#transaction-list').append(`<li class="list-group-item">From <b>${transData.senderName}</b> <span class="trans-amt badge badge-success">+${transData.amount.toFixed(2)}</span></li>`);
        }
      });
    }

  }

  sendMoney(toUID, amount, message="", receiverName="") {

    let newTransactionRef = db.ref('transactions').push();
    newTransactionRef.set({
        sender: auth.uid,
        receiver: toUID,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        amount: amount,
        message: message,
        senderName: auth.user.displayName.toProperCase(),
        receiverName: receiverName
    });

  }

}
