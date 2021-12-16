interface Window {
  $: JQuery
}
declare var window: Window;

export const enableJQuery = {
  init: () => {
    /**
     * ファイル外からjQueryを参照出来るようにする
     * @type {function(*=): *}
     */
    let $ = (window.$ = require('jquery'));
  },
};

/// <reference path="node_modules/@types/jquery/dist/jquery.slim.d.ts" />
