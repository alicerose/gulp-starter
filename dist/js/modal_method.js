'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;(function ($, undefined) {

  $.fn.mooodal = function (method) {

    var methods = {
      init: function init(options) {
        $('[data-modal]').each(function () {
          var opt = $.extend({
            autoClose: 0,
            duration: 300,
            method: 'inline',
            overlay: true,
            overlayClose: true,
            scrollLock: true
          }, options);
          $(this).appendTo('body');
        });
      },
      load: function load() {
        // 良い例
        console.log('load');
      },
      fade: function fade() {
        // 良い例
        console.log('fade');
      },
      hide: function hide() {
        // です
        console.log('hide');
      }
    };

    $.fn.mooodal = function (method) {

      // メソッド呼び出し部分
      if (methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object' || !method) {
        return methods.init.apply(this, arguments);
      } else {
        $.error('Method ' + method + ' does not exist on jQuery.mooodal');
      }
    };
  };
})(jQuery);