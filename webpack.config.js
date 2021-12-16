const terserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const configs = require('./gulp.config');

/**
 * production flag
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV === 'production';

const jsConfig = {
  entry: {
    bundle: './src/js/main.js',
  },
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
};

const tsConfig = {
  entry: {
    bundle: './src/ts/index.ts',
  },
  rules: [
    {
      test: /\.ts$/,
      use: ['ts-loader'],
    },
  ],
};

const app = {
  // モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
  mode: isProduction ? 'production' : 'development',
  //
  target: ['web', 'es5'],
  // エントリーポイントの設定
  entry: {},
  // 出力の設定
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [],
  },
  /**
   * Productionビルド時の最適化
   */
  optimization: {
    minimizer: [
      new terserPlugin({
        parallel: true,
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
    },
    extensions: ['.ts', '.js'],
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

if (configs.gulpConfig.js.typescript) {
  console.log('Script Language: TypeScript');
  app.entry = tsConfig.entry;
  app.module.rules = tsConfig.rules;
} else {
  console.log('Script Language: ECMAScript');
  app.entry = jsConfig.entry;
  app.module.rules = jsConfig.rules;
}

module.exports = app;
