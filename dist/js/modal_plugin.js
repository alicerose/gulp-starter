;(function($) {
  $.fn.mooodal = function(options) {

    var current;
    var elements = this;
    var opt = $.extend({
        duration     : 300,
        method       : 'inline',
        overlay      : true,
        overlayClose : true,
        scrollLock   : true
    }, options );

    var modalInit = () => {
      $('[data-modal]').each(function(){
        $(this).appendTo('body');
      })
    }

    var showOverlay = (target) => {
      if(opt.overlay == true){
        $('body').append('<div data-overlay></div>');
        $('[data-overlay]').attr('data-modal-target', target).fadeIn(opt.duration);
      }
    }

    var modalLaunch = (target,callback) => {
      console.log(target);
      showOverlay(target);
      $('[data-modal=' + target + ']').addClass('-visible');
      $('[data-modal-close]').attr('data-modal-target', target);
      scrollLock();
    }

    var modalClose = (target) => {
      $('[data-modal]').removeClass('-visible');
      if(opt.overlayClose == true){
        $('[data-overlay]').fadeOut(opt.duration);
        setTimeout(function() {
          $('[data-overlay]').remove();
          scrollLock('unlock');
        }, opt.duration);
      }
    }

    var scrollLock = (method) => {
      if(opt.scrollLock == true){
        if(method !== 'unlock'){
          current = $(document).scrollTop();
          $('body').addClass('js-modal-scrollLock').css('top', current*-1);
        } else {
          $('body').removeClass('js-modal-scrollLock').css('top', '');
          $(document).scrollTop(current);
        }
      }
    }

    $(window).on('load',function(){
      modalInit();
    });

    elements.on('click', function(){
      modalLaunch($(this).data('launch-modal'))
    });

    $(document).on('click', '[data-modal-target]', function(e){
      e.stopPropagation();
      modalClose($(this).data('modal-target'));
    })
  };
})(jQuery);