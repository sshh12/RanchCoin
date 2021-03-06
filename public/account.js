
class Account {

  constructor() {

    let balanceRef = db.ref(`accounts/${auth.uid}/balance`);
    balanceRef.on('value', this.onBalance);

    let transactionRef = db.ref(`accounts/${auth.uid}/transactions`);
    transactionRef.on('value', this.onHistory);

    let requestsRef = db.ref(`accounts/${auth.uid}/requests`);
    requestsRef.on('value', this.onHistory);

  }

  onBalance(data) {
    let balance = data.val() || 0.00;
    $('#cur-balance').html(balance.toFixed(2) + ' RC');
    account.balance = balance;
  }

  onHistory(data) {

    let history = data.val();

    if(history == null) {
      return;
    }

    if(data.key == 'requests') {
      $('#requests-list').html('');
    } else if(data.key == 'transactions') {
      $('#transaction-list').html('');
    }

    let transKeys = sortedObjKeys(history, -1);

    for(let key of transKeys) {

      db.ref(`transactions/${key}`).on('value', function(d) {

        let transData = d.val();

        if(transData.type == "send") {
          if(transData.sender === auth.uid) {
            $('#transaction-list').append(`<li class="list-group-item" id="trans-${key}">To <b>${transData.receiverName}</b> <span class="trans-amt badge badge-danger">-${transData.amount.toFixed(2)}</span></li>`);
          } else {
            $('#transaction-list').append(`<li class="list-group-item" id="trans-${key}">From <b>${transData.senderName}</b> <span class="trans-amt badge badge-success">+${transData.amount.toFixed(2)}</span></li>`);
          }
          $(`#trans-${key}`).on('click', () => {
            swal({
              title: `${transData.sender === auth.uid ? "Sent to " + transData.receiverName: "Recieved from " + transData.senderName} ${transData.amount.toFixed(2)}`,
              text: `${getFormattedTime(transData.timestamp)}\n\n${transData.message}`
            });
          });
        } else if(transData.type == "request") {
          $('#requests-list').append(`<li class="list-group-item" id="req-${key}">Request from <b>${transData.senderName}</b> <span class="trans-amt badge badge-warning">-${transData.amount.toFixed(2)}?</span></li>`);
          $(`#req-${key}`).on('click', () => {
            swal({
              title: `Send ${transData.senderName} ${transData.amount.toFixed(2)}?`,
              text: `${transData.message}`,
              buttons: ["Remove", "Pay"],
            }).then((response) => {
              if(response) {
                $('#sendFeedback').html('Tap Send to transfer requested funds.');
                $('#sendAddress').val(transData.sender);
                $('#inputSendNameEmail').val(transData.senderName);
                $('#sendName').val(transData.senderName);
                $('#sendAmount').val(transData.amount);
                $('#sendMessage').val('Sending requested RanchCoin.');
                $('#btn-send').trigger('click');
                $('#sendAmount').trigger('keyup');
                window.curRequestID = d.key;
              } else {
                $(`#req-${key}`).remove();
                account.removeRequest(d.key);
              }
            });
          })
        }
      });

    }

  }

  removeRequest(requestID) {
    db.ref(`accounts/${auth.uid}/requests/${requestID}`).remove();
  }

  doDeposit(certCode) {

    if(certCode != "") {

      swal("Redeemed!", "Your balance will update shortly.", "success");

      let newTransactionRef = db.ref('transactions').push();
      return newTransactionRef.set({
          type: "cert",
          sender: auth.uid,
          receiver: certCode,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          amount: 1, // all params ignored
          message: null,
          senderName: null,
          receiverName: null
      });

    }

  }

  sendMoney(toUID, amount, message="", receiverName="") {

    let newTransactionRef = db.ref('transactions').push();
    return newTransactionRef.set({
        type: "send",
        sender: auth.uid,
        receiver: toUID,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        amount: amount,
        message: message,
        senderName: auth.user.displayName.toProperCase(),
        receiverName: receiverName
    });

  }

  requestMoney(fromUID, amount, message="", receiverName="") {

    let newTransactionRef = db.ref('transactions').push();
    return newTransactionRef.set({
        type: "request",
        sender: auth.uid,
        receiver: fromUID,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        amount: amount,
        message: message,
        senderName: auth.user.displayName.toProperCase(),
        receiverName: receiverName
    });

  }

}
