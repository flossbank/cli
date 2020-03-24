const { execFile } = require('child_process')
const parseArgs = require('minimist')

class Pip {
  constructor (args) {
    this.args = parseArgs(args)
    this.verbs = new Set(['install', 'download'])
  }

  isSupportedVerb () {
    // pip <command> [options] and we currently only wrap install and download
    const installOrDownload = this.verbs.has(this.args._[0])
    // pip requires at least one arg after the command, so we do too
    const enoughArgs = this.args._.length > 1

    // and also `install -r` requires an additional argument
    const requirements = this.args.requirements || this.args.r
    if (requirements) {
      return installOrDownload && typeof requirements === 'string'
    }
    return installOrDownload && enoughArgs
  }

  getLanguage () {
    return 'python'
  }

  async getVersion () {
    return new Promise((resolve, reject) => {
      execFile('pip', ['-V'], { shell: true }, (e, stdout) => {
        if (e) return reject(e)
        if (!stdout) return reject(new Error('failed to determine pip version'))
        return resolve(stdout.trim())
      })
    })
  }
}

module.exports = Pip
