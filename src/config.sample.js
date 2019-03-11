const config = {

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

    // デフォルトで開くパスを変更する場合はコメントアウトして以下を修正
    // , startPath : '/'

    // Wordpressなどの動的サイトに使用する場合はコメントアウトしてホストを指定
    // proxy指定をした場合、serverの指定は無視されるようになる
    // , proxy : 'localhost:8888'

    // 任意のポートを指定したい場合はコメントアウト（デフォルト 3000）
    //, port : '8888'
  }
}

module.exports = {
  config: config
}