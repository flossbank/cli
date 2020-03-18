const { execFile } = require('child_process')

class Pip {
  static isSupportedVerb (cmd) {
    // pip <command> [options] and we currently only wrap install and download
    const split = cmd.split(' ')
    // pip requires at least one arg after the command, so we do too
    const enoughArgs = split.length > 2
    return enoughArgs && (split[1] === 'install' || split[1] === 'download')
  }

  static getLanguage () {
    return 'python'
  }

  static async getVersion () {
    return new Promise((resolve, reject) => {
      execFile('pip', ['-V'], { shell: true }, (e, stdout) => {
        if (e) return reject(e)
        if (!stdout) return reject(new Error('failed to determine npm version'))
        return resolve(stdout.trim())
      })
    })
  }
}

module.exports = Pip
