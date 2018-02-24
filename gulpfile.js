var gulp    = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: [
    'gulp-*',
    'autoprefixer',
    'css-mqpacker'
  ]
});

var browser = require('browser-sync').create();

// ディレクトリ
var dir = {
  src  : 'src/',
  dist : 'dist/'
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
    // ベンダープレフィックス付与 対象： http://browserl.ist/?q=last+2+versions%2C+ie+%3E%3D+8%2C+iOS+%3E%3D+9
    $.autoprefixer({browsers: 'last 2 versions, ie >= 7, iOS >= 9'}),
    // メディアクエリの整理
    $.cssMqpacker({sort: true})
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
  .pipe($.csscomb())
  // sourcemap出力先
  // css出力先からの相対パスで書く
  .pipe($.sourcemaps.write('../maps'))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist+'css'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// js圧縮
gulp.task("js", function() {
  return gulp.src([dir.src + '/js/**/*.js','!' + dir.src + 'js/lib/*.js'])
  // 圧縮するならコメントアウト解除
  //.pipe($.uglify())
  //.pipe($.rename({extname: '.min.js'}))
  .pipe(gulp.dest(dir.dist+'js'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// jsライブラリ移動
gulp.task('jslib', function() {
  return gulp.src([
    dir.src + 'js/lib/*'
  ])
  .pipe(gulp.dest(dir.dist + 'js/lib'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// 画像圧縮
gulp.task('images', function(){
  return gulp.src([
    dir.src + 'images/**/*'
  ])
  // 画像圧縮処理
  .pipe($.imagemin())
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist + 'images/'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// ファイル変更監視
gulp.task('watch', function() {
  gulp.watch([dir.src + 'ejs/**/*'], ['ejs']);
  gulp.watch([dir.src + 'scss/**/*'], ['sass']);
  gulp.watch([dir.src + 'js/**/*'], ['js']);
  gulp.watch([dir.src + 'js/lib/*'], ['jslib']);
  gulp.watch([dir.src + 'images/**/*'], ['images']);
});

// 標準タスク
gulp.task('default', ['server', 'watch']);