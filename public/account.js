
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
  }

  onTransactions(data) {

    let transactions = data.val();

    if(transactions !== null) {
      $('#transaction-list').html("");
    }

    for(let key in transactions) {
      db.ref(`transactions/${key}`).on('value', function(d) {
        let transData = d.val();
        if(transData.sender === auth.uid) {
          $('#transaction-list').append(`<li class="list-group-item">Purchase <span class="trans-amt badge badge-danger">-${transData.amount}</span></li>`);
        } else {
          $('#transaction-list').append(`<li class="list-group-item">Payment <span class="trans-amt badge badge-success">+${transData.amount}</span></li>`);
        }
      });
    }

  }

  sendMoney(toUID, amount) { // account.sendMoney("7vJnUpmeMnaKM8u8E3DbHxGNXfw1", 10)

    let balance = parseFloat($('#cur-balance').html().replace(" RC", ""));

    if(amount < 0 || balance < amount) {
      return;
    }

    let newTransactionRef = db.ref('transactions').push();
    newTransactionRef.set({
        sender: auth.uid,
        receiver: toUID,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        amount: amount
    });

  }

}
