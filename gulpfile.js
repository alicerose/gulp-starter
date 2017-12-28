var gulp         = require('gulp');
var ejs          = require('gulp-ejs');
//var path       = require('path');
var sass         = require("gulp-sass");
var sourcemaps   = require('gulp-sourcemaps');
var postcss      = require('gulp-postcss');
var autoprefixer = require("gulp-autoprefixer");
var mqpacker     = require('css-mqpacker');
var browserSync  = require('browser-sync');
var plumber      = require('gulp-plumber');
var notify       = require('gulp-notify');
var uglify       = require('gulp-uglify');
var imagemin     = require("gulp-imagemin");
var pngquant     = require("imagemin-pngquant");
var mozjpeg      = require('imagemin-mozjpeg');

/*
var paths = {
    srcDir : 'src',
    dstDir : 'dist'
}
*/

// 開発用サーバをローカルに立ち上げる
gulp.task('server', function() {
    browserSync.init({
        server: {baseDir: 'dist'}
    });
});

// ejsコンパイル
gulp.task("ejs", function() {
    gulp.src(["src/ejs/**/*.ejs",'!' + "src/ejs/**/_*.ejs"])
    // 書式エラーがあっても動作停止しない
    .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(ejs())
    .pipe(gulp.dest("dist/"))
});

// sassコンパイル
gulp.task("scss", function() {
    gulp.src("src/scss/**/*.scss")
    // 書式エラーがあっても動作停止しない
    .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    // sourcemapを出力するようにする
    .pipe(sourcemaps.init())
    // sassコンパイル
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss([
        // ベンダープレフィックス付与 対象： http://browserl.ist/?q=last+2+versions%2C+ie+%3E%3D+8%2C+iOS+%3E%3D+9
        require('autoprefixer')({browsers: 'last 2 versions, ie >= 7, iOS >= 9'}),
        // メディアクエリの整理
        require('css-mqpacker')
    ]))
    // sourcemap出力先
    .pipe(sourcemaps.write('../maps'))
    // 出力先ディレクトリ
    .pipe(gulp.dest("./dist/css"));
});

// js圧縮
gulp.task("js", function() {

    gulp.src(["src/js/**/*.js","!src/js/lib/*.js"])
    .pipe(uglify())
    .pipe(gulp.dest("./dist/js"));
    // libディレクトリのライブラリは何もせずそのまま移動
    gulp.src(["src/js/lib/*.js"])
    .pipe(gulp.dest("./dist/js/lib"));
});

// 画像圧縮
gulp.task('imagemin', function(){
    return gulp.src('src/images/*')
    .pipe(plumber())
    .pipe(imagemin([
        pngquant({
            quality: '65-80',
            speed: 1,
            floyd:0
        }),
        mozjpeg({
            quality:85,
            progressive: true
        }),
        imagemin.svgo(),
        imagemin.optipng(),
        imagemin.gifsicle()
        ]
        ))
    .pipe(gulp.dest('dist/images'));
});

// ライブリロード（自動更新）
gulp.task('reload', function () {
    browserSync.reload();
});

// 標準タスクに登録するジョブ
gulp.task('default', ['server'], function() {
    gulp.watch(['src/ejs/**/*.*'],["ejs"]);
    gulp.watch(['src/images/**/*.*'],["imagemin"]);
    gulp.watch(['src/scss/**/*.scss'],["scss"]);
    gulp.watch(['src/js/**/*.js'],["js"]);
    gulp.watch(['dist/**/*'], ['reload']);
});