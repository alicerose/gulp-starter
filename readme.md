# gulpボイラープレート

## 必要要件

### Node.js

https://nodejs.org/ja/download/

制作時点でLTS（安定版）最新の`ver 10.15.0`を前提としています。
古いバージョンを使用している場合使用するパッケージによっては不具合が出る可能性があるため、特別な理由がなければ上記バージョンを使用してください。

Node.jsのバージョン管理が出来るようにしておくのを推奨

|OS|名称|参考サイト|
|:---|:---|:---|
|Win|`nodist`|https://qiita.com/RyutaKojima/items/00c9653a609f739e78c7|
|Mac|~~`ndenv`~~|~~https://qiita.com/nishina555/items/d5a928f3314a02e15929~~|
|Mac|`nodenv`|https://qiita.com/daskepon/items/e47f7ee3ade252cdf2e6|

`ndenv`はメンテナンスが終了したとのこと
https://qiita.com/yurakawa/items/508df9fdf2ea35661aa5

## インストールまで

Windowsは「コマンドプロンプト」または「PowerShell」を使用します。
MacOSは「ターミナル」を使用します。
総称して「CLI」と表記します。

### Node.jsが動作するかの確認

CLIで`node -v`を打ち、`v10.15.0`と返ってくればOKです。

### ディレクトリに移動する

CLIで以下を入力：

`cd （移動したいディレクトリのパス）`

### パッケージの一括インストール

CLIで以下を入力：

`npm install` または `npm i`

### コンフィグ

~~`src/config.js.sample` -> `src/config.js`にリネーム~~

`v4.2.0` で以下のように変更しました。

* エディタでjsファイルと認識されずに哀しみを背負っていたので、サンプルファイル名を`config.js.sample`から`config.sample.js`へ変更しました。
* 起動時に`src/config.js`が存在しなかった場合、`src/config.sample.js`を元に作成するようにしました。
* 設定項目を追記しました。
  * https/proxy/port

`config.js`はGit上で管理されていません。（.gitignoreに指定されています）
ユーザ間で異なる設定が使われる可能性のある設定項目をまとめていますので、各自の環境に合わせて適時設定の上使用してください。

## ディレクトリ構造

|primary|secondary|備考|
|:---|:---|:---|
|[dist]||コンパイル済みのデータ出力先|
|[src]|[assets]|コピー専用ファイル格納先|
||[ejs]|EJSファイル格納先|
||[images]|画像ファイル格納先|
||[js]|JSファイル格納先|
||[scss]|SCSSファイル格納先|
||config.js|コンフィグファイル|
|.csscomb||css整形方法指定ファイル|
|.editorconfig||エディタが対応していれば適用されます|
|.gitignore||gitに含めないほうがいいものは予め指定してあります|
|.node-version||Node.jsのバージョンを強制出来ます|
|gulpfile.js||処理記述ファイル|
|package.json||パッケージ、コマンド登録ファイル|
|package-lock.json||パッケージの中のパッケージをバージョン管理|
|readme.md||このファイルです|

### 他プロジェクトに取り込む場合

* `.git`ディレクトリはgitが使用するファイル郡なので、他プロジェクトにコピーしないでください。
* `.node_modules`フォルダはインストールしたパッケージが入るディレクトリなので、コピーしないでください。（インストール作業を行えば各人の環境に生成されます）

## プロジェクト設定

`gulpfile.js:39`でプロジェクト間の共通設定が出来ます。ある程度見ただけで設定出来るようにコメントも付与してありますので、参考の上設定ください。特に必要性がなければ編集せずそのまま使用して頂いて構いません。基本的にはプロジェクト開始以降は変更をするべきものではないため、環境構築者が事前に設定したものを共通で使用すべきです。変更の必要が出てきた場合は、共同作業者と協議の上変更を実施してください。

```js:gulpfile.js
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
      $.postcssCachebuster({type: 'checksum'}) // キャッシュ避けを付与する
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
```

## タスク

### server

* サーバの起動

ローカルに開発用のサーバを立て、ソースに変更があった場合はその内容を自動で反映するよう監視します。デフォルトで3000番のポートを使用しますが、埋まっていた場合は自動で空いているポートを探して使用します。

`src/config.js`で開き方の指定や挙動の変更が出来ます。使わないオプションはコメントアウトしておき、使用する時のみコメントアウトを解除します。その他必要なオプションは任意に追記出来ます。

https://www.browsersync.io/docs/options

* server/https

httpではなく、httpsでサーバを起動します。

* ghostMode

デフォルトではゴーストモードを切ってあります。ゴーストモードを使用すると、ソースの変化等だけではなく操作内容も同期します。

* open

|値|内容|
|:---|:---|
|`internal`|localhostで開きます。|
|`external`|プライベートIPで開きます。|

* startPath

起動時に開くページを指定出来ます。

* proxy

Apacheなどの既存のサーバを介してbrowserSyncを立ち上げます。Wordpressなどの開発に導入する場合は、こちらを利用してください。
※proxyオプションはserverオプションと排他的なので、`server/https`などの設定は読み込まれなくなります。

* port

デフォルトで3000番を使用しているポートを、指定した任意の番号を使用するようになります。

### ejs

* EJSファイルをhtmlにコンパイルします。

ejsファイルの構文エラーでコンパイルが失敗した場合、出力ディレクトリにejsファイルがそのまま生成されてしまいます。後述の`npm run clean`スクリプトで、時々不要なゴミファイルを掃除するようにしてください。

オプションでキャッシュ避けのパラメータ付与、HTMLの整形が出来ます。

|オプション|デフォルト|内容|
|:---|:---|:---|
|ext|`html`||
|revision|`true`|画像やcss/jsのファイル指定時に`.jpg?rev`と書くと、ビルド時にハッシュを付与する|
|prettier|`false`|HTML整形する。整形方法はoptionsで指定|

### edge

* Edgeファイルをhtmlにコンパイルします。

ejsとは異なる思想のテンプレートエンジンで、`Laravel`で使用されている`Blade`や、`Python`で有名な`Jinja2`などといったテンプレートエンジンのような、ベースとなるレイアウトを拡張して構築するタイプのテンプレートエンジンです。
https://edge.adonisjs.com/

EJSと同等のオプションが使用出来ます。

|オプション|デフォルト|内容|
|:---|:---|:---|
|ext|`html`||
|revision|`true`|画像やcss/jsのファイル指定時に`.jpg?rev`と書くと、ビルド時にハッシュを付与する|
|prettier|`false`|HTML整形する。整形方法はoptionsで指定|

### scss

* scssファイルをcssファイルにコンパイルします。

現状以下の処理が組み込まれています。

|パッケージ|処理内容|補足|
|:---|:---|:---|
|postcss-autoprefixer|ベンダープリフィックスを付与する|`package.json`の`browserslist`準拠|
|postcss-css-mq-packer|メディアクエリ記述を一箇所にまとめる||
|postcss-flex-bugs-fixes|flexbox関連のバグを修正する||
|postcss-cachebuster|background-imageのキャッシュ回避|`checksum`/`timestamp`|
|gulp-clean-css|CSSファイルのミニファイ処理（圧縮）|`production`モードのみ有効|
|gulp-sass-glob|scssのimport時に一括指定|`@import '/フォルダ/**` でフォルダ内をimportする|

以下は組み込んではありますが、諸事情により使用していません。soucemapsを使用停止、または実質的に使用しないということであれば使用しても支障はありません。

|パッケージ|処理内容|停止理由|
|:---|:---|:---|
|csscomb|CSSファイルをルールに基づいて整形|sourcemapsに対応していないため|

### js

ES6->ES5にトランスパイルをして出力します。

変換対象がなかった場合は何も処理しないため、通常通り記述して構いません。一方で万が一余計な処理が行われて不具合を招くのを避けるため、jqueryなどのライブラリやプラグインはこのフォルダに含めず、`/src/assets`以下に配置するようにしてください。

|パッケージ|処理内容|補足|
|:---|:---|:---|
|gulp-babel|ES6記述のトランスパイル||
|gulp-strip-debug|`console.log`などの一括除去||
|gulp-uglify|ファイルのミニファイ処理（圧縮）|`production`モードのみ有効|

### images

画像ファイルを圧縮して出力します。

画像自体の圧縮と、メタ情報の削除を行います。設定によって圧縮率の変更も可能です。既に圧縮済みのファイルは再処理しません。

### assets

`src/assets`配下にあるファイル・ディレクトリは、何も処理されずにそのまま`dist/`へコピーされます。

## スクリプト一覧

|コマンド|実行内容|補足|
|:---|:---|:---|
|`npm start`|ソースのコンパイル、編集の監視、開発サーバの起動|`Ctrl+C`で停止|
|`npm run build`|ソースのコンパイルのみを実行||
|`npm run clean`|コンパイルされたソースの一括削除|`dist`ディレクトリが削除される|
|`npm run release`|納品用ビルドの作成（macOS用）|`production`モードで実行される|
|`npm run winrelease`|納品用ビルドの作成（Win用)|`production`モードで実行される|
|`npx gulp （タスク名）`|特定のタスクのみを実行|`npx`を使用するので注意|

## 更新履歴

|制作日|バージョン|内容|
|:---|:---|:---|
|2019/03/11|v4.2.0|EDGEテンプレートの実装、不要な処理の削除、コンフィグファイルの読み込み処理修正|
|2019/01/14|v4.1.0|オプション指定など追加|
|2019/01/05|v4.0.0|gulp4のリリースに合わせて書き直し|
|2018/09/30|v3.0.0|gulpfile.jsの書き直し
|2018/09/21|v2.0.0||
|2018/02/24|v1.1.0||
|2017/12/27|v1.0.0||