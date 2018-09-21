// requirements
const gulp    = require('gulp');
const $ = require('gulp-load-plugins')({
  pattern: [
    'gulp-*',
    'imagemin-*',
    'autoprefixer',
    'css-mqpacker',
    'run-sequence'
  ]
});

// utilities
const browser = require('browser-sync').create();

// env
const env = process.env.NODE_ENV;
const isProduction = (env !== undefined);

// directories
const dir = {
  src : 'src/',
  dist: 'dist/'
}

// ローカル上で開発用サーバ起動
gulp.task('server', () => {
  browser.init({
    server    : {baseDir: dir.dist}, // 起点となるディレクトリの指定
    ghostMode : false,               // trueでデバイス間のクリック・スクロールなども同期させる
    open      : "external"           // プライベートIPでブラウザ起動
  })
});

// SASS
gulp.task('sass', () => {
  const plugins = [
    $.autoprefixer({grid:true}),
    $.cssMqpacker({sort:true})
  ];

  return gulp.src([dir.src + 'scss/**/*.scss'])
  // 書式エラーがあっても動作停止しない
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // sassコンパイル、方式指定
  .pipe($.sass({outputStyle: 'expanded'}))
  // cssプラグインの適用
  .pipe($.postcss(plugins))
  // developなら整形する
  .pipe($.if(!isProduction, $.csscomb()))
  // sourcemapを生成する
  .pipe($.sourcemaps.init())
  // developならsourcemap出力する
  .pipe($.if(!isProduction, $.sourcemaps.write('../maps')))
  // productionなら圧縮する
  .pipe($.if(isProduction, $.cleanCss()))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist+'css'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

//
gulp.task('watch', () => {
  gulp.watch([dir.src + 'scss/**/*'], ['sass']);
});

gulp.task('default', () => {
  $.runSequence(
    'build',
    'server',
    'watch'
  );
});

gulp.task('build', () => {
  $.runSequence(
    'sass'
  );
});