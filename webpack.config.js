const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'flossbank.bundle.js',
    libraryTarget: 'commonjs2'
  },
  target: 'node'
}
