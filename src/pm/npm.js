const { spawn, execFile } = require('child_process')

module.exports = async ({ silent }, done) => {
  if (!silent) {
    return spawn('npm', process.argv.slice(2), { stdio: 'inherit' })
    // for offline testing: return spawn('ping', ['-c', '5', '127.0.0.1'], { stdio: 'inherit' })
  }
  return execFile('npm', process.argv.slice(2), done)
  // for offline testing: return execFile('ping', ['-c', '5', '127.0.0.1'], done)
}
