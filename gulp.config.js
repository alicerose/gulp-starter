import autoprefixer from 'autoprefixer';
import flexBugFixes from 'postcss-flexbugs-fixes';
import stylelint from 'stylelint';

export const gulpConfig = {
  dir: {
    src: 'src',
    dist: 'dist',
    assets: '/assets',
  },
  // https://browsersync.io/docs/options#option-server
  server: {
    server: {
      // ホストするディレクトリ
      baseDir: 'dist',
      // インデックスファイル名
      index: 'index.html',
      //
      directory: false,
    },
    // 使用するポート
    // https://browsersync.io/docs/options#option-port
    port: '3000',
    // 操作を追従させるか
    // https://browsersync.io/docs/options#option-ghostMode
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: false,
    },
    // サーバの立ち上げ方
    // 'local' localhostを使用する
    // 'external' IPを使用する
    // https://browsersync.io/docs/options#option-open
    open: 'local',
    // プロクシを通す
    // WordPressなどを介する場合はホストを指定
    // https://browsersync.io/docs/options#option-proxy
    proxy: null,
  },
  html: {
    // テンプレートエンジン
    engine: 'ejs',
    // テンプレートエンジンごとのオプション
    options: {
      ejs: {
        extension: 'html',
      },
    },
    // gitハッシュパラメータを置換するか
    revision: {
      enable: true,
      target: 'js|css|gif|jpg|jpeg|png|svg',
    },
  },
  scss: {
    style: {
      dev: { outputStyle: 'expanded' },
      prod: { outputStyle: 'compressed' },
    },
    plugins: [autoprefixer({ grid: true }), flexBugFixes(), stylelint],
  },
};
