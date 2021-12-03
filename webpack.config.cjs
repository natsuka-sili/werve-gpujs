const path = require('path') // pathモジュールの読み込み
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index2.js', // エントリポイント（デフォルトと同じ設定）
  output: { // 出力先（デフォルトと同じ設定）
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'), // パスの指定
      filename: 'index.html' // dist/html/以下にindex.htmlをビルド
    })
    // new HtmlWebpackPlugin({
    //   template: path.resolve(__dirname, 'src' , 'html', 'sample.html'),
    //   filename: 'html/sample.html'
    // })
  ],
  mode: 'development' // モード
}
