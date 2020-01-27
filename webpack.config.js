const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'flossbank.bundle.js',
    libraryTarget: 'commonjs2'
  },
  optimization: {
    // concatenateModules: true breaks AbortSignal (node-fetch)
    concatenateModules: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // keep_classnames: false breaks AbortSignal (node-fetch)
          keep_classnames: true
        }
      })
    ]
  },
  target: 'node'
}
