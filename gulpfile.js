// requirements
const gulp    = require('gulp');
const $ = require('gulp-load-plugins')({
  pattern: [
    'gulp-*',
    'imagemin-*',
    'autoprefixer',
    'css-mqpacker',
    'run-sequence',
    'babel'
  ]
});

// utilities
const browser = require('browser-sync').create();
const del     = require('del');

// env
const env = process.env.NODE_ENV;
const isProduction = (env !== undefined);
console.log('[Node Environment]',env, '[isProduction]',isProduction)

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

// SASSコンパイル
gulp.task('sass', () => {
  return gulp.src([dir.src + 'scss/**/*.scss'])
  // 変更のあったファイルのみビルド対象にする
  .pipe($.cached('scss'))
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // sassコンパイル、方式指定
  .pipe($.sass({outputStyle: 'expanded'}))
  // cssプラグインの適用
  .pipe($.postcss([
    $.autoprefixer({grid:true}),
    $.cssMqpacker({sort:true})
  ]))
  // developなら整形する
  .pipe($.if(!isProduction, $.csscomb()))
  // developならsourcemapを生成する
  .pipe($.if(!isProduction, $.sourcemaps.init()))
  // developならsourcemap出力する
  .pipe($.if(!isProduction, $.sourcemaps.write('../maps')))
  // productionなら圧縮する
  .pipe($.if(isProduction, $.cleanCss()))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist+'css'))
  // Sassを更新したらその場でブラウザに反映させる
  .pipe(browser.stream());
});

// EJSコンパイル
gulp.task('ejs', () => {
  return gulp.src([dir.src + 'ejs/**/*.ejs'])
  // エラーの場合は停止せずに通知を出す
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

// JSのトランスパイル・圧縮
gulp.task('js', () => {
  return gulp.src([dir.src + '/js/**/*.js','!' + dir.src + 'js/lib/*.js'])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // トランスパイル
  .pipe($.babel({
    presets: ['@babel/env']
  }))
  // productionなら圧縮する
  .pipe($.if(isProduction, $.uglify()))
  // 出力先ディレクトリ
  .pipe(gulp.dest(dir.dist+'js'))
  // ブラウザを更新する
  .pipe(browser.stream());
});

// 画像圧縮
const dirimage = {
  src: dir.src + 'images/',
  dist: dir.dist + 'images/'
}
gulp.task('images', () => {
  return gulp.src([dirimage.src + '**/*'])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // 変更のあったファイルのみビルド対象にする
  .pipe($.changed(dirimage.dist))
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
  .pipe(gulp.dest(dirimage.dist))
  // ブラウザを更新する
  .pipe(browser.stream());
});

//
gulp.task('static', function () {
  return gulp.src([
    dir.src + 'static/**/*',
    dir.src + 'static/.htaccess'
  ], {
    base: dir.src + 'static'
  })
  .pipe(gulp.dest(dir.dist))
});

// コンパイル済みのファイル削除
gulp.task('clean', function () {
  return del([dir.dist]);
});


// 監視対象ファイルの指定
gulp.task('watch', () => {
  gulp.watch([dir.src + 'ejs/**/*'], ['ejs']);
  gulp.watch([dir.src + 'scss/**/*'], ['sass']);
  gulp.watch([dir.src + 'js/**/*'], ['js']);
  gulp.watch([dir.src + 'images/**/*'], ['images']);
  gulp.watch([dir.src + 'static/**/*'], ['static']);
});

// 通常タスク
gulp.task('default', () => {
  $.runSequence(
    'build',
    'watch',
    'server'
  );
});

// ファイルの一括処理
gulp.task('build', () => {
  $.runSequence(
    'ejs',
    'sass',
    'js',
    'images',
    'static'
  );
});

// production環境用の一括処理
gulp.task('release', () => {
  $.runSequence(
    'clean',
    'build'
  );
});