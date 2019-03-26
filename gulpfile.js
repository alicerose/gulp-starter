// パッケージ読み込み
const browser  = require('browser-sync')
const crypto   = require('crypto')
const del      = require('del')
const fs       = require('fs')
const minimist = require('minimist')
const util     = require('util')

// gulp系統のパッケージ読み込み
const {watch, series, parallel, task, src, dest} = require('gulp');
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

  template : 'ejs', // 使用するテンプレートエンジンの選択（ejs/edge)

  html: {
    ext      : 'html', // EJSの出力拡張子
    revision : true,   // キャッシュ避けリビジョン付与
    prettier : false,  // HTMLを整形するか
    options  : {
      // https://prettier.io/docs/en/options.html
      tabWidth                  : 2,
      useTabs                   : false,
      htmlWhitespaceSensitivity : 'css'
    }
  },

  scss: {
    // 出力形式
    // 0 : nested     ネスト形式
    // 1 : expanded   展開状態（一般的なCSS方式）
    // 2 : compact    1行1クラス
    // 3 : compressed 圧縮済み
    output     : 1,

    csscomb    : false, // .csscomb.jsonの内容で整形するか
    minify     : true,  // リリースビルドで圧縮するか否か
    sourcemaps : true,  // sourcemapsの使用
    plugins: [
      $.autoprefixer({grid:true}), // ベンダープリフィックス付与
      $.cssMqpacker({sort:true}),  // メディアクエリ記述をまとめる
      $.postcssFlexbugsFixes(),    // Flexbox関連バグの修正
      $.postcssCachebuster({type: 'checksum',imagesPath: dir.dist.slice(1)}) // キャッシュ避けを付与する
    ]
  },

  js: {
    babel      : true, // トランスパイルするか否か
    stripDebug : true, // リリースビルドでデバッグメッセージを除去するか否か
    uglify     : true  // リリースビルドで圧縮するか否か
  },

  images: {
    // 圧縮率
    gif : 1,  // 1^3
    jpg : 80, // 0^100
    png : 80  // 0^100
  }
}

// 個人用設定ファイルの存在確認
const configFile = {
  'origin' : './src/config.sample.js', // サンプルファイル
  'file'   : './src/config.js'         // コンフィグファイル
}
const configExistCheck = (file=configFile.file, origin=configFile.origin) => {
  console.log(`[config] Config file exist check...`)
  try {
    fs.statSync(file)
    console.log(`[config] Config file found.`)
  }
  catch(err) {
    if(err.code === 'ENOENT') {
      console.log(`[config] Config file not found.`)

      // ファイルが存在しなければサンプルファイルをコピーする
      fs.copyFile(origin, file, (err) => {
        if (err) throw err
        console.log(`[config] generated from ${origin} -> ${file}.`)
      })
    }
  }
}
const configExist = configExistCheck()
const copyConfigAsync = util.promisify(fs.copyFile)

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

// コンフィグファイルから設定をロード
let config
task('config', (done) => {
  config = require(configFile.file).config
  if(config.version == undefined){
    console.log('[config] incompatible version detected.')
    copyConfigAsync(configFile.origin,configFile.file).then(() => {
      console.log(`[config] replaced from ${configFile.origin} -> ${configFile.file}.`)
      config = require(configFile.origin).config
      if(config.server.proxy == undefined){
        config.server.server.baseDir = dir.dist
      } else {
        delete config.server.server
      }
      done()
    }).catch((err) => console.error(err))
  } else {
    if(config.server.proxy == undefined){
      config.server.server.baseDir = dir.dist
    } else {
      delete config.server.server
    }
    done()
  }
})

// ローカル上で開発用サーバ起動
task('server', () => {
  browser.init(config.server)
})

// EJSコンパイル
task('ejs', () => {
  return src([
    dir.src + 'ejs/**/*.ejs',
    '!' + dir.src + '/ejs/**/_*.ejs'
  ])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // 拡張子設定
  .pipe($.ejs({}, {}, {"ext": "."+project.html.ext}))
  // キャッシュ避けリビジョン付与
  .pipe($.if(project.html.revision,
    $.replace(/\.(js|css|gif|jpg|jpeg|png|svg)\?rev/g, '.$1?rev='+revision)
  ))
  // オプションが有効になっていれば整形する
  .pipe($.if(project.html.prettier,
    $.prettier(project.html.options)
  ))
  // 出力先ディレクトリ
  .pipe(dest(dir.dist))
  // ブラウザを更新する
  .pipe(browser.stream())
})

// EDGEコンパイル
task('edge', () => {
  return src([
    dir.src + 'edge/**/*.edge',
    '!' + dir.src + '/edge/**/_*.edge'
  ])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // コンパイル
  .pipe($.edgejs())
  // キャッシュ避けリビジョン付与
  .pipe($.if(project.html.revision,
    $.replace(/\.(js|css|gif|jpg|jpeg|png|svg)\?rev/g, '.$1?rev='+revision)
  ))
  // オプションが有効になっていれば整形する
  .pipe($.if(project.html.prettier,
    $.prettier(project.html.options)
  ))
  // 出力先ディレクトリ
  .pipe(dest(dir.dist))
  // ブラウザを更新する
  .pipe(browser.stream())
})

// SASSコンパイル
task('sass', () => {
  const format = ['nested','expanded','compact','compressed']
  return src(dir.src + 'scss/**/*.scss', {sourcemaps: project.scss.sourcemaps})
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // scssファイルをまとめて読み込む
  .pipe($.sassGlob())
  // コンパイルと出力フォーマットの指定
  .pipe($.sass({outputStyle: format[project.scss.output]}))
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
});

// JSのトランスパイル・圧縮
task('js', () => {
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
})

// 画像圧縮
task('images', () => {
  return src([dir.src + 'images/**/*'])
  // エラーの場合は停止せずに通知を出す
  .pipe($.plumber({
    errorHandler: $.notify.onError("Error: <%= error.message %>")
  }))
  // 変更のあったファイルのみビルド対象にする
  .pipe($.changed(dir.dist + dir.images))
  // 画像圧縮処理とオプション
  .pipe($.imagemin([
    $.imagemin.gifsicle({optimizationLevel:project.images.gif}),
    $.imageminMozjpeg({quality:project.images.jpg}),
    $.imageminPngquant({quality:project.images.png}),
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
})

//
task('assets', () => {
  return src([
    dir.src + dir.assets + '**/*',
    dir.src + dir.assets + '*.*',
    dir.src + dir.assets + '.*'
  ], {
    base: dir.src + 'assets'
  })
  // 出力先
  .pipe(dest(dir.dist))
})

// コンパイル済みのファイル削除
task('clean', () => {
  return del([dir.dist])
})


// 監視対象ファイルの指定
task('watch', (done) => {
  watch([dir.src + project.template + '/**/*'], task(project.template))
  watch([dir.src + 'scss/**/*'], task('sass'))
  watch([dir.src + 'js/**/*'], task('js'))
  watch([dir.src + 'images/**/*'], task('images'))
  watch([dir.src + 'assets/**/*'], task('assets'))
  done()
})

// ファイルの一括処理
task('build', series(
  'config',
  project.template,
  'sass',
  'js',
  'images',
  'assets'
))

// 通常タスク
task('default', series(
  'build',
  'watch',
  'server'
))

// production環境用の一括処理
task('release', series(
  'clean',
  'build'
))