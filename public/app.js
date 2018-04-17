let db = firebase.database();

String.prototype.toProperCase = function () { // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function sortedObjKeys(obj, flip = 1) {

    return Object.keys(obj).sort((a,b) => (obj[a] - obj[b]) * flip);
}

$(document).ready(() => {

  window.tab = 'balance';

  makeTabs();
  makeQRBtns();
  makeSendBtns();

  window.auth = new Auth();

});

function postAuthInit() {

  window.account = new Account();

}

function makeTabs() {

  $('#page-send').hide();

  $('#btn-send').on('click', () => {
    $('#page-send').show(); $('#btn-request').removeClass('active'); $('#btn-send').addClass('active');
    $('#page-balance').hide(); $('#btn-balance').removeClass('active');
    $('#sendHeader').html('Send');
    $('#sendTransactionBtn').html('Send');
    window.tab = 'send';
  });

  $('#btn-balance').on('click', () => {
    $('#page-send').hide(); $('#btn-send').removeClass('active'); $('#btn-request').removeClass('active');
    $('#page-balance').show(); $('#btn-balance').addClass('active');
    window.tab = 'balance';
  });

  $('#btn-request').on('click', () => {
    $('#page-send').show(); $('#btn-send').removeClass('active'); $('#btn-request').addClass('active');
    $('#page-balance').hide(); $('#btn-balance').removeClass('active');
    $('#sendHeader').html('Request');
    $('#sendTransactionBtn').html('Request');
    window.tab = 'request';
  });

}

function makeQRBtns() {

  $('#useQRBtn').on('click', () => {

    window.scanner = new Instascan.Scanner({ video: document.getElementById('qrpreview'), mirror: false, backgroundScan: false });
    scanner.addListener('scan', (content) => {

      if(/[\w]{10,}/.test(content)) {

        db.ref(`users/${content}`).once('value').then((data) => {

          if(data) {

            let addresses = {};
            addresses[content] = data.val();
            $('#inputSendNameEmail').val(addresses[content].email);
            updateTransaction(addresses);

            $('#scanQRModal').modal('hide');
            scanner.stop();

          }

        });

      }
    });

    Instascan.Camera.getCameras().then((cameras) => {

      if (cameras.length > 0) {
        scanner.start(cameras[cameras.length - 1]);
        $('#scanQRModal').modal('show');
      } else {
        swal('Oops', 'No cameras found.', 'error');
      }

    }).catch(function (e) {
      alert(e);
    });

  });

  $('#scanQRClose').on('click', () => {

    $('#scanQRModal').modal('hide');
    scanner.stop();

  });

  $('#showMyQR').on('click', () => {

    let qrcode = new QRCode("qrcode", {
        text: auth.uid,
        colorDark : "#000000",
        colorLight : "#ffffff",
    });

    $('#myQRModal').modal('show');
    $('#myQRModal').on('hide.bs.modal', () => {
      $('#qrcode').html('');
    });

  });

  $('#myQRClose').on('click', () => {
    $('#myQRModal').modal('hide');
  });

}

function makeSendBtns() {

  $('#inputSendNameEmail').on('keyup', () => {

    let query = $('#inputSendNameEmail').val().toLowerCase();

    if(query.includes('@')) {

      db.ref('users').orderByChild('email').equalTo(query).once('value').then((data) => {
        updateTransaction(data.val());
      });

    } else if(query.includes(" ")) {

      db.ref('users').orderByChild('name').equalTo(query).once('value').then((data) => {
        updateTransaction(data.val());
      });

    } else {

      db.ref('users').orderByChild('firstname').equalTo(query).once('value').then((data) => {
        updateTransaction(data.val());
      });

    }

  });

  $('#sendAmount').on('keyup', () => {

    let amt = parseFloat($('#sendAmount').val());

    if(amt <= 0 || (amt > account.balance && window.tab == 'send')) {
      $('#sendAmount').removeClass('is-valid').addClass('is-invalid');
    } else {
      $('#sendAmount').addClass('is-valid').removeClass('is-invalid');
    }

  });

  $('#sendTransactionBtn').on('click', () => {

    let address = $('#sendAddress').val();
    let amt = parseFloat($('#sendAmount').val());
    let message = $('#sendMessage').val();
    let receiverName = $('#sendName').val();

    if(window.tab == 'send') {

      if(amt <= 0 || amt > account.balance || !(/[\w]{10,}/.test(address)) || address == auth.uid) {
        swal("Oops", "Unable to complete transaction.", "error");
        return;
      }

      account.sendMoney(address, amt, message, receiverName).then(() => {

        swal("RanchCoin Sent", "", "success");

      });

    } else if(window.tab == 'request') {

      swal("Not Supported", "", "warning");

    }

  });

}

function updateTransaction(addressData) {

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
