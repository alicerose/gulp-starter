const config = {

  version: '4.2.0',

  // 開発用サーバ設定
  server: {

    server : {

      // サーバがhttpsに対応していればhttpsで開く
      https : false

    }

    // trueでデバイス間のクリック・スクロールなども同期させる
    , ghostMode : false

    // external : プライベートIPでブラウザ起動
    // internal : localhostでブラウザ起動
    , open : "internal"

    // デフォルトで開くパスを変更する場合はコメントアウトを解除して以下を修正
    // , startPath : '/'

    // Wordpressなどの動的サイトに使用する場合はコメントアウトを解除してホストを指定
    // proxy指定をした場合、serverの指定は無視されるようになる
    // , proxy : 'localhost:8888'

    // 任意のポートを指定したい場合はコメントアウトを解除（デフォルト 3000）
    //, port : '8888'
  }
}

module.exports = {
  config: config
}