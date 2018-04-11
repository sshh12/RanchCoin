
class Account {

  constructor() {

    this.balanceRef = db.ref(`users/${auth.uid}/balance`);
    this.balanceRef.on('value', function(snapshot) {
      $('#cur-balance').html(snapshot.val().toFixed(2) + ' RC');
    });

  }

}
