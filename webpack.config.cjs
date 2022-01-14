const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // entry: './src/index.js',
  entry: './src/test_index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  cache: {
    type: 'filesystem'
  },
  plugins: [
    new HtmlWebpackPlugin({
      // template: path.resolve(__dirname, 'src', 'index.html'),
      template: path.resolve(__dirname, 'src', 'test_index.html'),
      filename: 'main.html',
      favicon: './src/images/favicon.ico'
    })
  ],
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(scss|sass|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, './dist')
    },
    host: '0.0.0.0'
  }
}
