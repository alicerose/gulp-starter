module.exports = {
  mode: 'development',
  entry: "./src/webpack/main.js",
  output: {
    filename: "app.js"
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
                '@babel/preset-env',
              ]
            }
          }
        ]
      }
    ]
  }
}