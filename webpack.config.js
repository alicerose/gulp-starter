const terserPlugin = require('terser-webpack-plugin');

/**
 * 環境変数取得
 * @type {string}
 */
const currentEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

/**
 * productionモードならtrueを返す
 * @type {boolean}
 */
const isProduction = currentEnv === 'production';

/**
 * コンパイル設定
 * @type {{mode: string, output: {filename: string}, entry: string, optimization: {minimizer: [TerserPlugin]}, module: {rules: [{test: RegExp, use: [{loader: string, options: {presets: [string]}}]}]}}}
 */
module.exports = {
  /**
   * コンパイルモード
   * `development` : 開発モード
   * `production` : リリース用ビルド
   * 指定しなければdevelopmentで起動
   * NODE_ENVを拾うので原則指定不要
   */
  mode: currentEnv,
  /**
   * エントリーポイント
   */
  entry: "./src/webpack/main.js",
  /**
   * 出力ファイル名
   * ディレクトリはgulp側で制御しているため設定は無視される
   */
  output: {
    filename: "app.js"
  },
  /**
   * 処理方法指定
   */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ]
            }
          }
        ]
      }
    ],
  },
  /**
   * 最適化処理
   */
  optimization: {
    minimizer: [
      new terserPlugin({
        cache: !isProduction,
        parallel: !isProduction,
        sourceMap: true,
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          compress: {drop_console: isProduction}
        }
      }),
    ],
  }
}