let db = firebase.database();

$(document).ready(function() {

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

  window.auth = new Auth();

});

function postAuthInit() {
  window.account = new Account();
}
