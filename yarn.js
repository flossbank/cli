module.exports = () => {
  try {
    require('yarn/lib/v8-compile-cache')
  } catch (e) {}
  
  const cli = require('yarn/lib/cli')
  cli.default()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error(error.stack || error.message || error)
      process.exitCode = 1
    })
}
