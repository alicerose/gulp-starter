// modal
var defer = $.Deferred();
var duration = 300;

var modalLoad = () => {
  $('[data-modal]').each(function(){
    $(this).appendTo('body');
  })
  $('body').append('<div data-overlay></div>');
}

var showOverlay = (target, method) => {
  $('[data-overlay]').attr('data-overlay', target).attr('data-onclick', method);
  $('[data-overlay]').fadeIn(duration);
}

var modalLaunch = (target, overlay, callback) => {
  showOverlay(target, 'noClose');
  $('[data-modal=' + target + ']').addClass('-visible');
}

var modalClose = (target) => {
  var method = $('[data-overlay]').attr('data-onclick');
  if(method == 'close'){
    $('[data-modal]').removeClass('-visible');
    $('[data-overlay="' + target + '"]').fadeOut(duration);
  }
}

$('[data-launch-modal]').on('click', function(){
  modalLaunch($(this).data('launch-modal'));
})

$(document).on('click', '[data-overlay]', function(){
  modalClose($(this).data('overlay'));
})

$(window).on('load',function(){
  modalLoad();
});