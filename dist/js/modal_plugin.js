/*********************************
jQuery Mooodal Plugin
version : 0.1
**********************************/

;(function($, undefined) {

  $.fn.mooodal = function(options) {
    var current;
    var elements = this;
    var opt = $.extend({
      autoClose    : 0, // @todo Close modal in millisecond, 0 is disabled
      duration     : 300, // duration of each functions
      method       : 'inline', // inline | ajax
      overlay      : true, // uses overlay or not.
      overlayClose : true, // modal can be closed on clicking overlay.
      scrollLock   : true // locks scroll under the modal.
    }, options);

    var modalInit = () => {
      $('[data-modal]').each(function(){
        $(this).appendTo('body');
      })
    }

    var modalLoad = () => {
      var def = new $.Deferred;
      console.log(opt.method)
      if(opt.method == 'ajax'){
        $.ajax({
          url　: opt.contents,
          dataType : 'html',
          success　: function(data){
            $('body').append(data);
            console.log('contents loaded from :',opt.contents)
            def.resolve();
          },
          error: function(data){
            console.log('failed to load', opt.contents);
            def.reject();
          }
        });
      } else {
        def.resolve();
      }
      return def.promise();
    }

    var showOverlay = (target) => {
      if(opt.overlay == true){
        $('body').append('<div data-overlay></div>');
        $('[data-overlay]').attr('data-modal-target', target).fadeIn(opt.duration);
      }
    }

    var modalLaunch = (target,callback) => {
      var promise = modalLoad();
      promise.done(function(){
        showOverlay(target);
        $('[data-modal=' + target + ']').addClass('-visible').attr('data-modal-method', opt.method);
        $('[data-modal=' + target + '] .c_modal_inner').fadeIn(opt.duration);
        $('[data-modal-close]').attr('data-modal-target', target);
        scrollLock();
      })
    }

    var modalFade = (target) => {
      var def = new $.Deferred;
      $('[data-modal="' + target + '"] .c_modal_inner').fadeOut(opt.duration);
      if(opt.overlayClose == true){
        $('[data-overlay][data-modal-target="' + target + '"]').fadeOut(opt.duration);
      };
      setTimeout(function() {
        def.resolve();
      }, opt.duration);
      return def.promise();
    }

    var modalClose = (target) => {
      var promise = modalFade(target);
      promise.done(function(){
        $('[data-overlay][data-modal-target="' + target + '"]').remove();
        scrollLock('unlock');
        $('[data-modal="' + target + '"]').removeClass('-visible');
        $('[data-modal-method="ajax"]').remove();
        console.log('close function done');
      })
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

    elements.on('click', function(e){
      e.preventDefault();
      console.log('start');
      modalLaunch($(this).data('launch-modal'))
    });

    $(document).on('click', '[data-modal-target]', function(e){
      e.stopPropagation();
      modalClose($(this).data('modal-target'));
    })

  $('[data-modal-target]').on('click', function(e){
      e.stopPropagation();
      modalClose($(this).data('modal-target'));
    })
  };

})(jQuery);