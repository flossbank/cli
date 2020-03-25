const { fs: { ls, rm } } = require('./_common')

module.exports = {
  getNodeModules: () => ls('./node_modules/*').map(dir => dir.name),
  deleteNodeModules: () => rm('node_modules')
}
