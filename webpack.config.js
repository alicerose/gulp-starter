const terserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

/**
 * production flag
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
  mode: isProduction ? 'production' : 'development',
  // エントリーポイントの設定
  entry: {
    app: './src/webpack/main.js',
    app2: './src/webpack/sub.js',
  },
  // 出力の設定
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'entry',
                    corejs: 3,
                  },
                ],
              ],
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
        ],
      },
    ],
  },
  /**
   * Productionビルド時の最適化
   */
  optimization: {
    minimizer: [
      new terserPlugin({
        cache: false,
        parallel: true,
        sourceMap: false,
        terserOptions: {
          compress: { drop_console: true },
        },
      }),
    ],
  },
  /**
   * 依存関係解決
   */
  resolve: {
    /**
     * エイリアス
     */
    alias: {
      '@': path.resolve(__dirname, 'src'),
      API: path.resolve(__dirname, 'src/webpack/api'),
      CONSTANTS: path.resolve(__dirname, 'src/webpack/constants'),
      CONTROLLERS: path.resolve(__dirname, 'src/webpack/controllers'),
      MODELS: path.resolve(__dirname, 'src/webpack/models'),
      UTILS: path.resolve(__dirname, 'src/webpack/utilities'),
      VENDOR: path.resolve(__dirname, 'src/webpack/vendor'),
    },
    modules: ['node_modules'],
  },
  plugins: [
    new webpack.ProvidePlugin({
      /**
       * jqueryをnpmから使用
       */
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
};
