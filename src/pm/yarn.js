module.exports = (done) => {
  try {
    require('yarn/lib/v8-compile-cache')
  } catch (e) {}

  const cli = require('yarn/lib/cli')
  cli.default()
    .then(done)
    .catch((error) => {
      console.error(error.stack || error.message || error)
      done(error)
    })
}
