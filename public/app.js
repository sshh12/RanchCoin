let db = firebase.database();

String.prototype.toProperCase = function () { // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function reverseObj(obj) {

    let newObj = {};
    let keys = Object.keys(obj);

    for (var i = keys.length - 1; i >= 0; i--) {
        let value = obj[keys[i]];
        newObj[keys[i]] = value;
    }

    return newObj;
}

$(document).ready(function() {

  makeTabs();
  makeBtns();

  window.auth = new Auth();

});

function postAuthInit() {

  window.account = new Account();

  /*let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
  scanner.addListener('scan', function (content) {
    alert(content);
  });
  Instascan.Camera.getCameras().then(function(cameras) {
    if (cameras.length > 0) {
      scanner.start(cameras[1]);
    } else {
      console.error('No cameras found.');
    }
  }).catch(function (e) {
    console.error(e);
  });*/

}

function makeTabs() {

  $('#page-send').hide();
  $('#page-request').hide();

  $('#btn-send').on('click', () => {
    $('#page-send').show(); $('#btn-send').addClass('active');
    $('#page-balance').hide(); $('#btn-balance').removeClass('active');
    $('#page-request').hide(); $('#btn-request').removeClass('active');
  });

  $('#btn-balance').on('click', () => {
    $('#page-send').hide(); $('#btn-send').removeClass('active');
    $('#page-balance').show(); $('#btn-balance').addClass('active');
    $('#page-request').hide(); $('#btn-request').removeClass('active');
  });

  $('#btn-request').on('click', () => {
    $('#page-send').hide(); $('#btn-send').removeClass('active');
    $('#page-balance').hide(); $('#btn-balance').removeClass('active');
    $('#page-request').show(); $('#btn-request').addClass('active');
  });

}

function makeBtns() {

  function updateSend(addressData) {

    if(!addressData) {
      $('#inputSendNameEmail').removeClass('is-valid').addClass('is-invalid');
      $('#sendFeedback').removeClass('valid-feedback').addClass('invalid-feedback');
      $('#sendFeedback').html('No accounts found...');
      $('#sendAddress').val('');
    } else if(Object.keys(addressData).length == 1) {
      let toUID = Object.keys(addressData)[0];
      $('#inputSendNameEmail').addClass('is-valid').removeClass('is-invalid');
      $('#sendFeedback').addClass('valid-feedback').removeClass('invalid-feedback');
      $('#sendFeedback').html('Account found! ' + addressData[toUID].name.toProperCase());
      $('#sendAddress').val(toUID);
      $('#sendName').val(addressData[toUID].name.toProperCase());
    } else {
      $('#inputSendNameEmail').removeClass('is-valid').addClass('is-invalid');
      $('#sendFeedback').removeClass('valid-feedback').addClass('invalid-feedback');
      $('#sendFeedback').html('Multiple accounts found...');
      $('#sendAddress').val('');
    }

  }

  $('#inputSendNameEmail').on('keyup', () => {

    let query = $('#inputSendNameEmail').val();

    if(query.includes('@')) {

      db.ref('users').orderByChild('email').equalTo(query).once('value').then((data) => {
        updateSend(data.val());
      });

    } else if(query.includes(" ")) {

      db.ref('users').orderByChild('name').equalTo(query).once('value').then((data) => {
        updateSend(data.val());
      });

    } else {

      db.ref('users').orderByChild('firstname').equalTo(query).once('value').then((data) => {
        updateSend(data.val());
      });

    }

  });

  $('#sendAmount').on('keyup', () => {

    let amt = parseFloat($('#sendAmount').val());

    if(amt <= 0 || amt > account.balance) {
      $('#sendAmount').removeClass('is-valid').addClass('is-invalid');
    } else {
      $('#sendAmount').addClass('is-valid').removeClass('is-invalid');
    }

  });

  $('#sendMoneyBtn').on('click', () => {

    let address = $('#sendAddress').val();
    let amt = parseFloat($('#sendAmount').val());
    let message = $('#sendMessage').val();
    let receiverName = $('#sendName').val();

    if(amt <= 0 || amt > account.balance || address.length < 20 || address == auth.uid) {
      swal("Oops", "Check the values you have entered.", "error");
      return;
    }

    account.sendMoney(address, amt, message, receiverName);

    swal("RanchCoin Sent", "", "success");

  })

}
