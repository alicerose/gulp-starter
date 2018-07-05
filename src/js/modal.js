// modal
var current;
var defer    = $.Deferred();
var duration = 300;

var modalInit = () => {
  $('[data-modal]').each(function(){
    $(this).appendTo('body');
  })
}

var showOverlay = (target, method) => {
  $('body').append('<div data-overlay></div>');
  $('[data-overlay]').attr('data-overlay', target).attr('data-onclick', method).fadeIn(duration);
}

var modalLaunch = (target, overlay, callback) => {
  console.log(target);
  showOverlay(target, 'close');
  $('[data-modal=' + target + ']').addClass('-visible');
  scrollLock();
}

var modalClose = (target) => {
  console.log(target);
  var method = $('[data-overlay]').attr('data-onclick');
  if(method == 'close'){
    $('[data-modal]').removeClass('-visible');
    $('[data-overlay="' + target + '"]').fadeOut(duration);
    setTimeout(function() {
      $('[data-overlay="' + target + '"]').remove();
      scrollLock('unlock');
    }, duration);
  }
}

var scrollLock = (method) => {
  if(method !== 'unlock'){
    current = $(document).scrollTop();
    $('body').addClass('js-modal-scrollLock').css('top', current*-1);
  } else {
    $('body').removeClass('js-modal-scrollLock').css('top', '');
    $(document).scrollTop(current);
  }
}

$('[data-launch-modal]').on('click', function(){
  modalLaunch($(this).data('launch-modal'));
})

$(document).on('click', '[data-overlay]', function(){
  modalClose($(this).data('overlay'));
})

$(document).on('click', '[data-modal-close]', function(){
  modalClose($(this).parents('[data-modal]').data('modal'));
})

$(window).on('load',function(){
  modalInit();
});