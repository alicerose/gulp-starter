// パッケージ読み込み
const browser  = require('browser-sync')
const crypto   = require('crypto')
const del      = require('del')
const minimist = require('minimist')

// gulp系統のパッケージ読み込み
const {watch, series, task, src, dest} = require('gulp');
const $ = require('gulp-load-plugins')({
  DEBUG: false,
  pattern: [
    'gulp-*',
    'postcss-*',
    'imagemin-*',
    'autoprefixer',
    'css-mqpacker'
  ],
  overridePattern: false
})

// ディレクトリ設定
const dir     = {
  // ソースディレクトリ
  src    : './src/',
  // ビルドディレクトリ
  dist   : './dist/',
  // assetsディレクトリ
  assets : 'assets/',
  // css出力先
  css    : 'assets/css',
  // js出力先
  js     : 'assets/js',
  // 画像出力先
  images : 'assets/images'
}

// プロジェクト設定
const project = {
  ejs: {
    ext      : 'html',    // EJSの出力拡張子
    revision : true, // キャッシュ避けリビジョン付与
    prettier : false, // HTMLを整形するか
    options  : {
      // https://prettier.io/docs/en/options.html
      tabWidth : 2,
      useTabs : false,
      htmlWhitespaceSensitivity : 'css'
    }
  },

  scss: {
    csscomb    : false, // .csscomb.jsonの内容で整形するか
    minify     : true,  // リリースビルドで圧縮するか否か
    sourcemaps : true,  // sourcemapsの使用
    plugins: [
      $.autoprefixer({grid:true}), // ベンダープリフィックス付与
      $.cssMqpacker({sort:true}),  // メディアクエリ記述をまとめる
      $.postcssFlexbugsFixes(),    // Flexbox関連バグの修正
      $.postcssCachebuster({type: 'checksum'}) // キャッシュ避けを付与する
    ]
  },

  js: {
    babel      : true, // トランスパイルするか否か
    stripDebug : true, // リリースビルドでデバッグメッセージを除去するか否か
    uglify     : true  // リリースビルドで圧縮するか否か
  }
}

// 個人用設定ファイル読み込み
const config  = require('./src/config').config

// NODE_ENVに指定がなければ開発モードをデフォルトにする
const envOption = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'development' }
}
const options      = minimist(process.argv.slice(2), envOption)
const isProduction = (options.env === 'production') ? true : false
console.log('[build env]', options.env, '[is production]', isProduction)

// リビジョン番号の生成
const revision = crypto.randomBytes(8).toString('hex')
console.log('build revision:', revision)

/* ============================================ */
/* --------------- 各タスクの処理 --------------- */
/* ============================================ */

// ローカル上で開発用サーバ起動
task('server', () => {
  browser.init({
    server: {
      baseDir   : dir.dist,
      ghostMode : config.server.ghostMode,
      open      : config.server.open,
      startPath : config.server.startPath
    }
  })
})

// EJSコンパイル
task('ejs', (done) => {
  return src([
    dir.src + 'ejs/**/*.ejs',
    '!' + dir.src + '/ejs/**/_*.ejs'
  ])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // 拡張子設定
  .pipe($.ejs({}, {}, {"ext": "."+project.ejs.ext}))
  // キャッシュ避けリビジョン付与
  .pipe($.if(project.ejs.revision,
    $.replace(/\.(js|css|gif|jpg|jpeg|png|svg)\?rev/g, '.$1?rev='+revision)
  ))
  .pipe($.if(project.ejs.prettier,
    $.prettier(project.ejs.options)
  ))
  // 出力先ディレクトリ
  .pipe(dest(dir.dist))
  // ブラウザを更新する
  .pipe(browser.stream())
  // タスクの終了宣言
  done()
})

// SASSコンパイル
task('sass', (done) => {
  return src(dir.src + 'scss/**/*.scss', {sourcemaps: project.scss.sourcemaps})
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // scssファイルをまとめて読み込む
  .pipe($.sassGlob())
  // コンパイル
  .pipe($.sass({outputStyle:'expanded'}))
  // cssプラグインの適用
  .pipe($.postcss(project.scss.plugins))
  // developなら整形する
  .pipe($.if(!isProduction && project.scss.csscomb, $.csscomb()))
  // productionなら圧縮する
  .pipe($.if(isProduction && project.scss.minify, $.cleanCss()))
  // 出力先ディレクトリ
  .pipe(dest(dir.dist+dir.css, {sourcemaps: '../maps/'}))
  // Sassを更新したらリロードせずに直接反映させる
  .pipe(browser.stream())
  // タスクの終了宣言
  done()
});

// JSのトランスパイル・圧縮
task('js', (done) => {
  return src([
    dir.src + '/js/**/*.js'
  ])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // トランスパイル
  .pipe($.if(project.js.babel,
    $.babel({
      presets: ['@babel/preset-env']
    })
  ))
  // productionならconsole.logを出力しない
  .pipe($.if(isProduction && project.js.stripDebug, $.stripDebug()))
  // productionなら圧縮する
  .pipe($.if(isProduction && project.js.uglify, $.uglify()))
  // 出力先ディレクトリ
  .pipe(dest(dir.dist+dir.js))
  // ブラウザを更新する
  .pipe(browser.stream())
  // タスクの終了宣言
  done()
})

// 画像圧縮
task('images', (done) => {
  return src([dir.src + 'images/**/*'])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // 変更のあったファイルのみビルド対象にする
  .pipe($.changed(dir.dist + dir.images))
  // 画像圧縮処理とオプション
  .pipe($.imagemin([
    $.imagemin.gifsicle(),
    $.imageminMozjpeg({ quality: 80 }),
    $.imageminPngquant(),
    $.imagemin.svgo()
  ], {
    // 変換ログ出力
    verbose: true
  }))
  // メタ情報再削除
  .pipe($.imagemin())
  // 出力先ディレクトリ
  .pipe(dest(dir.dist + dir.images))
  // ブラウザを更新する
  .pipe(browser.stream())
  // タスクの終了宣言
  done()
})

//
task('assets', (done) => {
  return src([
    dir.src + dir.assets + '**/*',
    dir.src + dir.assets + '*.*',
    dir.src + dir.assets + '.*'
  ], {
    base: dir.src + 'assets'
  })
  .pipe(dest(dir.dist))
  // タスクの終了宣言
  done()
})

// コンパイル済みのファイル削除
task('clean', (done) => {
  return del([dir.dist])
  // タスクの終了宣言
  done()
})


// 監視対象ファイルの指定
task('watch', (done) => {
  watch([dir.src + 'ejs/**/*'], task('ejs'))
  watch([dir.src + 'scss/**/*'], task('sass'))
  watch([dir.src + 'js/**/*'], task('js'))
  watch([dir.src + 'images/**/*'], task('images'))
  watch([dir.src + 'assets/**/*'], task('assets'))
  done()
})

// ファイルの一括処理
task('build', series(
  'ejs',
  'sass',
  'js',
  'images',
  'assets'
), (done) => {
  console.log('start build task')
  done()
})

// 通常タスク
task('default', series(
  'build',
  'watch',
  'server'
),(done) => {
  console.log('start default task')
  done()
})

// production環境用の一括処理
task('release', series(
  'clean',
  'build'
), (done) => {
  console.log('start release task')
  done()
})