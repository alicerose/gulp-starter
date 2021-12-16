export const enableJQuery = {
  init: () => {
    /**
     * ファイル外からjQueryを参照出来るようにする
     * @type {function(*=): *}
     */
    let $ = (window.$ = require('jquery'));
  },
};
