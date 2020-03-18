const { execFile } = require('child_process')
const parseArgs = require('minimist')

class Pip {
  static isSupportedVerb (cmd) {
    const split = cmd.split(' ')
    // pip <command> [options] and we currently only wrap install and download
    const installOrDownload = split[1] === 'install' || split[1] === 'download'
    // pip requires at least one arg after the command, so we do too
    const enoughArgs = split.length > 2
    const args = parseArgs(split)

    // and also `install -r` requires an additional argument
    if (args.r) {
      return installOrDownload && typeof args.r === 'string'
    }
    return installOrDownload && enoughArgs
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
