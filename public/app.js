let db = firebase.database();

$(document).ready(function() {

  makeTabs();
  makeBtns();

  window.auth = new Auth();

});

function postAuthInit() {
  window.account = new Account();
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

  $('#inputSendNameEmail').on('change', () => {

    let query = $('#inputSendNameEmail').val();

    if(query.includes('@')) {

      db.ref('users').orderByChild('email').equalTo(query).once('value').then((data) => {
        console.log(data.val());
      });

    } else if(query.includes(" ")) {

      db.ref('users').orderByChild('name').equalTo(query).once('value').then((data) => {
        console.log(data.val());
      });

    } else {

      db.ref('users').orderByChild('firstname').equalTo(query).once('value').then((data) => {
        console.log(data.val());
      });

    }

  });

}
