var gulp    = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: [
    'gulp-*',
    'autoprefixer',
    'css-mqpacker',
    'postcss-cachebuster'
  ]
});

// imagemin
var mozjpeg  = require('imagemin-mozjpeg');
var pngquant = require('imagemin-pngquant');

// utility
var browser     = require('browser-sync').create();
var minimist    = require('minimist');
var crypto      = require('crypto');
var del         = require('del');
var runSequence = require('run-sequence');

// webpack
var webpack       = require('webpack');
var webpackStream = require('webpack-stream');

// environment setting
var env          = process.env.NODE_ENV;
var isProduction = (env !== undefined);
console.log('[Environment]', env, '[isProduction]', isProduction);

// リリース用ハッシュ生成
var hash = crypto.randomBytes(8).toString('hex');
console.log('Build Hash:', hash);

// ディレクトリ
if(isProduction == true){
  var dir = {
    src  : 'src/',
    dist : 'release/',
    prod : 'release/'
  }
  var webpackConfig = require("./webpack.config.production");
} else {
  var dir = {
    src  : 'src/',
    dist : 'dist/',
    prod : 'release/'
  }
  var webpackConfig = require("./webpack.config");
}

// 開発用サーバをローカルに立ち上げる
gulp.task('server', function() {
  browser.init({
    server: {baseDir: dir.dist}
  });
});

// ejsコンパイル
gulp.task("ejs", function() {
  return gulp.src([dir.src + 'ejs/**/*.ejs','!' + dir.src + '/ejs/**/_*.ejs'])
  // 書式エラーがあっても動作停止しない
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // 拡張子をhtmlにする
  .pipe($.ejs({}, {}, {"ext": ".html"}))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// sassコンパイル
gulp.task("sass", function() {
  var plugins = [
    // ベンダープレフィックス付与
    $.autoprefixer({grid: true}),
    // メディアクエリの整理
    $.cssMqpacker({sort: true}),
    // CSS内の画像キャッシュ飛ばし
    $.postcssCachebuster({
      type: 'checksum',
      imagesPath: '/'+dir.dist
    })
  ];
  return gulp.src([dir.src + 'scss/**/*.scss'])
  // 書式エラーがあっても動作停止しない
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // sourcemapを出力するようにする
  .pipe($.sourcemaps.init())
  // sassコンパイル、方式指定
  // expanded   : 展開
  // compressed : 圧縮
  .pipe($.sass({outputStyle: 'expanded'}))
  // css整形
  .pipe($.postcss(plugins))
  .pipe($.if(!isProduction, $.csscomb()))
  // sourcemap出力先
  // css出力先からの相対パスで書く
  .pipe($.if(!isProduction, $.sourcemaps.write('../maps')))
  //本番なら圧縮する
  .pipe($.if(isProduction, $.cleanCss()))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist+'css'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// js圧縮
gulp.task("js", function() {
  return gulp.src([dir.src + '/js/**/*.js','!' + dir.src + 'js/lib/*.js'])
  // 書式エラーがあっても動作停止しない
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  .pipe($.changed(dir.dist+'js'))
  .pipe($.babel({
    presets: ['env']
  }))
  // productionなら圧縮する
  .pipe($.if(isProduction, $.uglify()))
  //.pipe($.rename({extname: '.min.js'}))
  .pipe(gulp.dest(dir.dist+'js'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// webpack
gulp.task('webpack', function() {
  return webpackStream(webpackConfig, webpack)
  .pipe(gulp.dest(dir.dist+'js'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// 画像圧縮
gulp.task('images', function(){
  return gulp.src([dir.src + 'images/**/*'])
  .pipe($.changed(dir.dist + 'images/'))
  // 画像圧縮処理
  .pipe($.imagemin([
    $.imagemin.gifsicle(),
    mozjpeg({ quality: 80 }),
    pngquant(),
    $.imagemin.svgo()
  ], {
    verbose: true
  }))
  // メタ情報再削除
  .pipe($.imagemin())
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist + 'images/'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// コピー（配置するだけのリソース用）
gulp.task('copy', function(){
  return gulp.src([
    dir.src + 'resource/**/*',
    dir.src + 'resource/.htaccess'
  ], {
    // コピー元ディレクトリ
    // このディレクトリを起点としてdistへコピーする
    base: dir.src + 'resource'
  })
  .pipe($.changed(dir.dist))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// キャッシュ回避用ハッシュ付与（本番用ビルドのみ）
gulp.task('hash', function () {
  return gulp.src([
    dir.dist + 'index.html',
    dir.dist + '/**/*.html'
  ])
  .pipe($.if(isProduction, $.replace('.css"','.css?' + hash + '"')))
  .pipe($.if(isProduction, $.replace('.js"','.js?' + hash + '"')))
  .pipe(gulp.dest(dir.dist))
});

// distを消去する（再構築用）
gulp.task('clean', function () {
  return del([dir.dist, dir.prod]);
});

// ファイル変更監視
gulp.task('watch', function() {
  gulp.watch([dir.src + 'ejs/**/*'], ['ejs']);
  gulp.watch([dir.src + 'scss/**/*'], ['sass']);
  gulp.watch([dir.src + 'js/**/*'], ['js']);
  gulp.watch([dir.src + 'webpack/**/*'], ['webpack']);
  gulp.watch([dir.src + 'images/**/*'], ['images']);
  gulp.watch([dir.src + 'resource/**/*'], ['copy']);
});

// 標準タスク
gulp.task('default', function(callback) {
  runSequence(
    'build',
    'server',
    'watch',
    callback
  );
});

// 再構築
gulp.task('build', function(callback) {
  runSequence(
    'clean',
    'images',
    ['ejs', 'sass', 'copy'],
    'js',
    'webpack',
    'hash',
    callback
  );
});