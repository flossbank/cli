const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'flossbank.bundle.js',
    libraryTarget: 'commonjs2',
    pathinfo: false
  },
  optimization: {
    namedModules: false,
    namedChunks: false,
    nodeEnv: false,
    flagIncludedChunks: true,
    occurrenceOrder: true,
    sideEffects: true,
    usedExports: true,
    splitChunks: {
      hidePathInfo: true,
      minSize: 30000,
      maxAsyncRequests: 5,
      maxInitialRequests: 3
    },
    noEmitOnErrors: true,
    checkWasmTypes: true,
    minimize: true,
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
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],
  target: 'node',
  node: {
    __dirname: false, // by default webpack replaces __dirname with `/` which is... wrong
    __filename: false // by default webpack replaces __filename with `index.js` which is... also wrong
  }
}
