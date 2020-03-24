const { execFile } = require('child_process')
const parseArgs = require('minimist')
const readPackageJson = require('../util/readPackageJson')

class Npm {
  constructor (args) {
    this.args = parseArgs(args)
    this.verbs = new Set(['install', 'i'])
  }

  isSupportedVerb () {
    // confirm that the command being run is a supported form:
    //   npm install <optional pkgs here>
    //   npm i <optional pkgs here>

    const installing = this.args._.length === 1 && this.verbs.has(this.args._[0])
    return installing
  }

  isQuietMode () {
    return this.args.silent || this.args.quiet || this.args.s
  }

  async getTopLevelPackages () {
    // for simplicity sake:
    //   if format is `npm install package1...packageN`, send those pkgs
    //   if format is `npm install`, send package.json.deps + devDeps
    //   if format is `npm install --only=prod`, send package.json.deps
    // npm logic is slightly different than this depending on the presence
    // of a package-lock.json, but i think this will suffice for now

    // this is the `npm install` case
    if (this.args._.length === 1) {
      const prodOnly = this.args.production || this.args.only === 'prod' || process.env.NODE_ENV === 'production'
      const { deps, devDeps } = await readPackageJson()
      return prodOnly ? deps : deps.concat(devDeps)
    }

    // this is the `npm install package1...packageN` case
    return this.args._.slice(1) // args._[0] === 'install'
  }

  async getRegistry () {
    return new Promise((resolve, reject) => {
      execFile('npm', ['config', 'get', 'registry'], { shell: true }, (e, stdout) => {
        if (e) return reject(e)
        if (!stdout) return reject(new Error('failed to determine registry'))
        return resolve(stdout.trim())
      })
    })
  }

  getLanguage () {
    return 'javascript'
  }

  async getVersion () {
    return new Promise((resolve, reject) => {
      execFile('npm', ['-v'], { shell: true }, (e, stdout) => {
        if (e) return reject(e)
        if (!stdout) return reject(new Error('failed to determine npm version'))
        return resolve(`npm@${stdout.trim()}`)
      })
    })
  }
}

module.exports = Npm
