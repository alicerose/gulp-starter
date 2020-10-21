import { dest, series, src, task, watch } from 'gulp';
import del from 'del';
import { gulpConfig } from './gulp.config';
import browser from 'browser-sync';
import gulpIf from 'gulp-if';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackConfig from './webpack.config';

/**
 * 設定内容を外部ファイルから取得
 * @type {{server: {proxy: string}, scss: {plugins: [*, *], style: {prod: {outputStyle: string}, dev: {outputStyle: string}}}}}
 */
const config = gulpConfig;

/**
 * productionビルド
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * ディレクトリ
 * @type {{src: string, dist: string}}
 */
const dir = gulpConfig.dir;

/**
 * 開発サーバ
 */
task('server', () => {
  browser.init(config.server);
});

/**
 * 開発サーバのリロード
 */
task('reload', done => {
  browser.reload();
  done();
});

/**
 * SCSSコンパイル
 */
task('scss', () => {
  return src(dir.src + '/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass(isProduction ? config.scss.style.prod : config.scss.style.dev))
    .pipe(postcss(config.scss.plugins))
    .pipe(gulpIf(!isProduction, sourcemaps.write()))
    .pipe(dest(dir.dist + dir.assets + '/css/'))
    .pipe(browser.stream());
});

/**
 * WebpackでJSのコンパイル
 */
task('js', () => {
  return webpackStream(webpackConfig, webpack)
    .pipe(dest(dir.dist + dir.assets + '/js/'))
    .pipe(browser.stream());
});

/**
 * 画像のコピー
 */
task('images', () => {
  return src(dir.src + '/images/**')
    .pipe(dest(dir.dist + dir.assets + '/images/'))
    .pipe(browser.stream());
});

task('assets', () => {
  return src(dir.src + '/assets/**')
    .pipe(dest(dir.dist))
    .pipe(browser.stream());
});

/**
 * ファイル更新監視
 */
task('watch', done => {
  watch(dir.src + '/scss/**/*.scss', task('scss'));
  watch(dir.src + '/webpack/**/*.js', task('js'));
  watch(dir.src + '/images/**/*.*', task('images'));
  watch(dir.src + '/assets/**/*.*', task('assets'));
  watch(dir.dist + '/**/*.php', task('reload'));
  done();
});

/**
 * ビルドしたディレクトリの削除
 */
task('clean', () => {
  return del([dir.dist]);
});

/**
 * ビルドタスク
 */
task('build', series('clean', 'scss', 'js', 'images', 'assets'));

/**
 * 標準タスク
 */
task('default', series('build', 'watch', 'server'));
