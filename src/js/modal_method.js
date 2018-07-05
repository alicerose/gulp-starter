;(function($, undefined) {

  $.fn.mooodal = function(method) {

    var methods = {
      init : function( options ) {
        $('[data-modal]').each(function(){
          var opt = $.extend({
            autoClose    : 0,
            duration     : 300,
            method       : 'inline',
            overlay      : true,
            overlayClose : true,
            scrollLock   : true
          }, options);
          $(this).appendTo('body');
        })
      },
      load : function( ) {
        // 良い例
        console.log('load')
      },
      fade : function( ) {
        // 良い例
        console.log('fade')
      },
      hide : function( ) {
        // です
        console.log('hide')
      }
    };

    $.fn.mooodal = function( method ) {

      // メソッド呼び出し部分
      if ( methods[method] ) {
        return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.mooodal' );
      }

    };

  };

})(jQuery);