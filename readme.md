<!-- prettier-ignore-start -->
# gulpボイラープレート

## 必要要件

### Node.js

https://nodejs.org/ja/download/

制作時点でLTS（安定版）最新の`ver 12.X`を前提としています。
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

CLIで`node -v`を打ち、`v12.X.X`と返ってくればOKです。

### ディレクトリに移動する

CLIで以下を入力：

`cd （移動したいディレクトリのパス）`

### パッケージの一括インストール

CLIで以下を入力：

`npm install` または `npm i`

### コンフィグ

`gulp.config.js`を編集してください。

## ディレクトリ構造

```
├── dist // コンパイル結果（ignoredされてます）
├── gulp.config.js // gulpのタスク定義ファイル
├── gulpfile.babel.js // gulpのタスクファイル
├── import-resolver.js // JetBrains聖IDEでのエイリアス
├── package-lock.json
├── package.json // node.js
├── readme.md // このファイル
├── src
│   ├── assets // コピーする静的ファイル
│   ├── edge // HTMLテンプレートエンジンにedgeを使用する際のソース
│   ├── ejs // HTMLテンプレートエンジンにejsを使用する際のソース
│   ├── images // 画像
│   ├── scss // scss
│   └── webpack // jsファイル
└── webpack.config.js // webpackの処理を記述するファイル
```

### 他プロジェクトに取り込む場合

* `.git`ディレクトリはgitが使用するファイル郡なので、他プロジェクトにコピーしないでください。
* `.node_modules`フォルダはインストールしたパッケージが入るディレクトリなので、コピーしないでください。（インストール作業を行えば各人の環境に生成されます）

## プロジェクト設定

`gulp.config.js`でプロジェクト間の共通設定が出来ます。ある程度見ただけで設定出来るようにコメントも付与してありますので、参考の上設定ください。特に必要性がなければ編集せずそのまま使用して頂いて構いません。基本的にはプロジェクト開始以降は変更をするべきものではないため、環境構築者が事前に設定したものを共通で使用すべきです。変更の必要が出てきた場合は、共同作業者と協議の上変更を実施してください。

```js
export const gulpConfig = {
  dir: {
    src: 'src',
    dist: 'dist',
    assets: '/assets',
  },
  server: {
    // https://browsersync.io/docs/options#option-server
    server: {
      baseDir: 'dist',
      index: 'index.html',
      directory: false,
    },
    // https://browsersync.io/docs/options#option-port
    // port: '3000',
    // https://browsersync.io/docs/options#option-ghostMode
    // ghostMode: false,
    // https://browsersync.io/docs/options#option-open
    // open: 'internal,
    // https://browsersync.io/docs/options#option-proxy
    // proxy: 'localhost:8080',
  },
  html: {
    engine: 'ejs',
    options: {
      ejs: {
        extension: 'html',
      },
    },
    revision: true,
  },
  scss: {
    style: {
      dev: { outputStyle: 'expanded' },
      prod: { outputStyle: 'compressed' },
    },
    plugins: [autoprefixer({ grid: true }), flexBugFixes()],
  },
};
```

## タスク

### server

* サーバの起動

ローカルに開発用のサーバを立て、ソースに変更があった場合はその内容を自動で反映するよう監視します。デフォルトで3000番のポートを使用しますが、埋まっていた場合は自動で空いているポートを探して使用します。

`gulp.config.js`で開き方の指定や挙動の変更が出来ます。使わないオプションはコメントアウトしておき、使用する時のみコメントアウトを解除します。その他必要なオプションは任意に追記出来ます。

https://www.browsersync.io/docs/options

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
* ファイルの拡張子に `?rev=` がついているファイルに対して、Gitのコミットハッシュを付与します。
    * 例：`foo.css?rev` -> `foo.css?rev=1q2w3e4r5t6y`
    * キャッシュが残存して更新が反映されない状況を回避する用です。
    * コンフィグファイルの `html.revision` をfalseにした場合は出力しません。

### edge

* Edgeファイルをhtmlにコンパイルします。

ejsとは異なる思想のテンプレートエンジンで、`Laravel`で使用されている`Blade`や、`Python`で有名な`Jinja2`などといったテンプレートエンジンのような、ベースとなるレイアウトを拡張して構築するタイプのテンプレートエンジンです。
https://edge.adonisjs.com/

### scss

* scssファイルをcssファイルにコンパイルします。
* productionビルドではソースマップを出力しません。

|パッケージ|処理内容|補足|
|:---|:---|:---|
|postcss-autoprefixer|ベンダープリフィックスを付与する|`package.json`の`browserslist`準拠|
|postcss-flex-bugs-fixes|flexbox関連のバグを修正する||
|gulp-sass-glob|scssのimport時に一括指定|`@import '/フォルダ/**` でフォルダ内をimportする|

### webpack

* webpackを利用してバンドルされたjsファイルを生成します。
* babelによるトランスパイルを行います。
* productionビルドではコンソールログ出力を削除したファイルをビルドします。
* ソースファイルはESLint+Prettierによるフォーマッタが使用できます。

### images

* 画像をビルドディレクトリに転送します。

### assets

* `src/assets`配下にあるファイル・ディレクトリは、何も処理されずにそのまま`dist/`へコピーされます。
* `dist`直下に出力されるので、imagesと使い分けてください。

## スクリプト一覧

|コマンド|実行内容|補足|
|:---|:---|:---|
|`npm start`|ソースのコンパイル、編集の監視、開発サーバの起動|`Ctrl+C`で停止|
|`npm run build`|ソースのコンパイルのみを実行||
|`npm run build:production`|ソースのコンパイルのみを実行||
|`npm run clean`|コンパイルされたソースの一括削除|`dist`ディレクトリが削除される|
|`lint:fix`|Lintを実行し、可能な場合はソースを修正します||

## 更新履歴

* 主要更新内容のみ抜粋
* 全リリースノートは以下を参照
https://github.com/alicerose/gulp-starter/releases

|制作日|バージョン|内容|
|:---|:---|:---|
|2021/12/16|v5.3.0|TypeScript対応|
|2021/10/21|v5.2.0|StyleLint対応|
|2020/10/21|v5.0.0|babel化でリビルド、タスクの全リライト|
|2019/03/11|v4.2.0|Edgeテンプレートの実装、不要な処理の削除、コンフィグファイルの読み込み処理修正|
|2019/01/14|v4.1.0|オプション指定など追加|
|2019/01/05|v4.0.0|gulp4のリリースに合わせて書き直し|
|2018/09/30|v3.0.0|gulpfile.jsの書き直し
|2018/09/21|v2.0.0||
|2018/02/24|v1.1.0||
|2017/12/27|v1.0.0||

<!-- prettier-ignore-end -->
