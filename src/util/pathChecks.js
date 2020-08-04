const os = require('os')
const path = require('path')

class PathChecks {
  inHome (...filepaths) {
    return path.join(os.homedir(), ...filepaths)
  }

  inConfig (...filepaths) {
    return this.inHome('.config', ...filepaths)
  }
}

module.exports = PathChecks
