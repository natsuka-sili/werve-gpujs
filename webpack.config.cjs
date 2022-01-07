const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  cache: {
    type: 'filesystem'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      filename: 'main.html',
      favicon: './src/images/favicon.ico'
    })
  ],
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false }
          }
        ]
      }
    ]
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, './dist')
    },
    host: '0.0.0.0',
    open: true
  }
}
