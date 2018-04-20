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
  makeDepositBtns();
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

function initQRReader(callback) {

  window.scanner = new Instascan.Scanner({ video: document.getElementById('qrpreview'), mirror: false, backgroundScan: false });
  scanner.addListener('scan', callback);

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

}

function makeQRBtns() {

  $('#useQRBtn').on('click', () => {

    initQRReader((content) => {

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

function makeDepositBtns() {

  $('#showDepositOptions').on('click', () => {
    swal({
      title: 'How?',
      buttons: ["Manually", "QR Code"]
    }).then((response) => {
      if(response) {
        initQRReader((content) => {
          $('#scanQRModal').modal('hide');
          scanner.stop();
          account.doDeposit(content);
        });
      } else {
        swal({
          closeOnClickOutside: false,
          content: {
            element: "input",
            attributes: {
              placeholder: "Deposit Code",
              type: "text"
            },
          },
        }).then(account.doDeposit);
      }
    });
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

    curRequestID = null;

  });

  $('#sendAmount').on('keyup', () => {

    let amt = parseFloat($('#sendAmount').val());

    if(amt <= 0 || (amt > account.balance && window.tab == 'send')) {
      $('#sendAmount').removeClass('is-valid').addClass('is-invalid');
    } else {
      $('#sendAmount').addClass('is-valid').removeClass('is-invalid');
    }

    curRequestID = null;

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

      if(curRequestID) {
        account.removeRequest(curRequestID);
      }

      account.sendMoney(address, amt, message, receiverName).then(() => {

        swal("RanchCoin Sent", "", "success");

      });

    } else if(window.tab == 'request') {

      if(amt <= 0 || !(/[\w]{10,}/.test(address)) || address == auth.uid) {
        swal("Oops", "Unable to complete request.", "error");
        return;
      }

      account.requestMoney(address, amt, message, receiverName).then(() => {

        swal("Request Sent", "", "success");

      });

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

function getFormattedTime(time) { // Thanks S.O. https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site

  let time_formats = [
    [60, 'seconds', 1], // 60
    [120, '1 minute ago', '1 minute from now'], // 60*2
    [3600, 'minutes', 60], // 60*60, 60
    [7200, '1 hour ago', '1 hour from now'], // 60*60*2
    [86400, 'hours', 3600], // 60*60*24, 60*60
    [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
    [604800, 'days', 86400], // 60*60*24*7, 60*60*24
    [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
    [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
    [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
    [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
    [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
    [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
    [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
    [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
  ];
  let seconds = (+new Date() - time) / 1000,
    token = 'ago',
    list_choice = 1;

  if (seconds == 0) {
    return 'Just now'
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'from now';
    list_choice = 2;
  }
  let i = 0, format;
  while (format = time_formats[i++])
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
}
