const { fs: { ls, rm } } = require('./_common')

module.exports = {
  getNodeModules: () => ls('./node_modules/*').map(dir => dir.name),
  deleteNodeModules: () => rm('node_modules'),
  deleteSuccessArtifacts: () => rm('quoted_passthrough_arg_success'),
  getQuotedArgArtifact: () => ls('quoted_passthrough_arg_success')
}
