/*********************************
jQuery Mooodal Plugin
version : 0.1

@todo
- メソッド化
- モーダルから別のモーダルへ移動
- transition
- オプション増やす
**********************************/

;(function($, undefined) {

  var el = {
    close : '[data-modal-close]',
    modal   : '[data-modal]',
    visible : '[data-modal].-visible',
    target  : '[data-modal-target]',
    overlay : '[data-overlay]'
  }

  $.fn.mooodal = function(options) {
    var current;
    var elements = this;
    var modalCounts;
    var opt = $.extend({
      autoClose    : 0, // @todo Close modal in millisecond, 0 is disabled
      duration     : 100, // duration of each functions
      method       : 'inline', // inline | ajax
      overlay      : true, // uses overlay or not.
      overlayClose : true, // modal can be closed on clicking overlay.
      scrollLock   : true // locks scroll under the modal.
    }, options);

    var modalInit = () => {
      $(el.modal).each(function(){
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
        $(el.overlay).attr('data-modal-target', target).fadeIn(opt.duration);
      }
    }

    var modalLaunch = (target,callback) => {
      var promise = modalLoad();
      promise.then(function(){
        modalCounts = $(el.visible).length;
        $('[data-modal-target]').off('click');
        console.log('Modal opened:',modalCounts);
        if(modalCounts == 0){
          showOverlay(target);
        } else {
          modalClose($(el.visible).data('modal'), 'multiple');
          $(el.overlay).attr('data-modal-target', target);
          $('[data-modal-target]').off('click');
        }
        $('[data-modal=' + target + ']').addClass('-visible').attr('data-modal-method', opt.method);
        $('[data-modal=' + target + '] .c_modal_inner').fadeIn(opt.duration);
        $(el.close).attr('data-modal-target', target);
        scrollLock();
      }).done(function (){
        $('[data-modal-target]').on('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          modalClose($(this).data('modal-target'));
        })
      })
    }

    var modalFade = (target, method) => {
      var def = new $.Deferred;
      $('[data-modal="' + target + '"] .c_modal_inner').fadeOut(opt.duration);
      if(opt.overlayClose == true && method !== 'multiple'){
        $('[data-overlay][data-modal-target="' + target + '"]').fadeOut(opt.duration);
      };
      setTimeout(function() {
        def.resolve();
      }, opt.duration);
      return def.promise();
    }

    var modalClose = (target, method) => {
      console.log(target, method);
      var promise = modalFade(target, method);
      promise.done(function(){
        if(method !== 'multiple'){
          $('[data-overlay][data-modal-target="' + target + '"]').remove();
        }
        scrollLock('unlock');
        $('[data-modal="' + target + '"]').removeClass('-visible');
        $('[data-modal-method="ajax"]').remove();
        $('[data-modal-target]').off('click');
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

    $('el.target').on('click', function(e){
      e.stopPropagation();
      modalClose($(this).data('modal-target'));
    })
  };

})(jQuery);