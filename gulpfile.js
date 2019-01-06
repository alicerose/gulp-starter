// パッケージ読み込み
const browser  = require('browser-sync')
const del      = require('del')
const minimist = require('minimist');

// gulp系統のパッケージ読み込み
const gulp    = require('gulp')
const $       = require('gulp-load-plugins')({
  pattern: [
    'gulp-*',
    'run-sequence',
    'autoprefixer',
    'css-mqpacker',
    'postcss-flexbugs-fixes',
    'imagemin-*'
  ]
})

// プロジェクト設定
const project = {

  ejs: {
    ext : 'html' // EJSの出力拡張子
  },

  scss: {
    plugins: [
      $.autoprefixer({grid:true}), // ベンダープリフィックス付与
      $.cssMqpacker({sort:true}),  // メディアクエリ記述をまとめる
      $.postcssFlexbugsFixes()     // Flexbox関連バグの修正
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

//console.log(project)
//console.log(config)

// ディレクトリ設定
const dir     = {
  src    : './src/',
  dist   : './dist/',
  assets : 'assets/',
  images : {
    src : './src/images/',
    dist: './dist/assets/images/'
  }
}

// NODE_ENVに指定がなければ開発モードをデフォルトにする
const envOption = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'development' }
}
const options      = minimist(process.argv.slice(2), envOption)
const isProduction = (options.env === 'production') ? true : false
console.log('[build env]', options.env, '[is production]', isProduction)

/* ============================================ */
/* --------------- 各タスクの処理 --------------- */
/* ============================================ */

// ローカル上で開発用サーバ起動
gulp.task('server', () => {
  browser.init({
    server    : {baseDir: dir.dist},
    ghostMode : config.server.ghost,
    open      : config.server.open
  })
})

// EJSコンパイル
gulp.task('ejs', (done) => {
  return gulp.src([
    dir.src + 'ejs/**/*.ejs',
    '!' + dir.src + '/ejs/**/_*.ejs'
  ])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // 拡張子設定
  .pipe($.ejs({}, {}, {"ext": "."+project.ejs.ext}))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist))
  // ブラウザを更新する
  .pipe(browser.stream())
  // タスクの終了宣言
  done()
})

// SASSコンパイル
gulp.task('sass', (done) => {
  return gulp.src([dir.src + 'scss/**/*.scss'])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // scssファイルをまとめて読み込む
  .pipe($.sassGlob())
  // コンパイル
  .pipe($.sass())
  // developならsourcemapを生成する
  .pipe($.if(!isProduction, $.sourcemaps.init()))
  // cssプラグインの適用
  .pipe($.postcss(project.scss.plugins))
  // developなら整形する
  .pipe($.if(!isProduction, $.csscomb()))
  // developならsourcemap出力する
  .pipe($.if(!isProduction, $.sourcemaps.write('../maps')))
  // productionなら圧縮する
  .pipe($.if(isProduction, $.cleanCss()))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist+dir.assets+'css'))
  // Sassを更新したらリロードせずに直接反映させる
  .pipe(browser.stream());
  // タスクの終了宣言
  done()
});

// JSのトランスパイル・圧縮
gulp.task('js', (done) => {
  return gulp.src([
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
  .pipe(gulp.dest(dir.dist+dir.assets+'js'))
  // ブラウザを更新する
  .pipe(browser.stream())
  // タスクの終了宣言
  done()
})

// 画像圧縮
gulp.task('images', (done) => {
  return gulp.src([dir.images.src + '/**/*'])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // 変更のあったファイルのみビルド対象にする
  .pipe($.changed(dir.images.dist))
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
  .pipe(gulp.dest(dir.images.dist))
  // ブラウザを更新する
  .pipe(browser.stream())
  // タスクの終了宣言
  done()
})

//
gulp.task('assets', (done) => {
  return gulp.src([
    dir.src + dir.assets + '**/*',
    dir.src + dir.assets + '*.*',
    dir.src + dir.assets + '.*'
  ], {
    base: dir.src + 'assets'
  })
  .pipe(gulp.dest(dir.dist))
  // タスクの終了宣言
  done()
})

// コンパイル済みのファイル削除
gulp.task('clean', (done) => {
  return del([dir.dist])
  // タスクの終了宣言
  done()
})


// 監視対象ファイルの指定
gulp.task('watch', (done) => {
  gulp.watch([dir.src + 'ejs/**/*'], gulp.task('ejs'))
  gulp.watch([dir.src + 'scss/**/*'], gulp.task('sass'))
  gulp.watch([dir.src + 'js/**/*'], gulp.task('js'))
  gulp.watch([dir.src + 'images/**/*'], gulp.task('images'))
  gulp.watch([dir.src + 'assets/**/*'], gulp.task('assets'))
  done()
})

// ファイルの一括処理
gulp.task('build', gulp.series(
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
gulp.task('default', gulp.series(
  'build',
  'watch',
  'server'
),(done) => {
  console.log('start default task')
  done()
})

// production環境用の一括処理
gulp.task('release', gulp.series(
  'clean',
  'build'
), (done) => {
  console.log('start release task')
  done()
})