const { execFile } = require('child_process')
const parseArgs = require('minimist')
const pkgJsonUtil = require('../util/readPackageJson')

class Yarn {
  constructor (args) {
    this.args = parseArgs(args)
    this.verbs = new Set(['install', 'add'])
  }

  isSupportedVerb () {
    // confirm that the command being run is a supported form:
    //   yarn
    //   yarn install
    //   yarn add <optional pkgs here>
    // TODO yarn is actually pretty strict about ordering: yarn add [packages] [flags]
    // `yarn add -g something` is invalid and therefore we shouldn't show ads

    const justYarn = this.args._.length === 2 // ['node', 'yarn']
    const justInstall = this.args._.length === 3 && this.args._[2] === 'install'
    const installingFromPkgJson = justYarn || justInstall
    const installingSpecificPkg = this.args._[2] === 'add' && this.args._.length > 3

    return installingFromPkgJson || installingSpecificPkg
  }

  async getTopLevelPackages () {
    // yarn seems to install all dependencies in all cases (except prod=prod only)
    // rules we will use (for now)
    //   if format is `yarn add pkg1...pkgN [-g]`, send those pkgs + package.json.deps + devDeps
    //   if format is `yarn` or `yarn install`, send package.json.deps + devDeps
    //   if `--production`, send package.json.deps
    // yarn logic is slightly different than this depending on the presence
    // of a yarn.lock, but i think this will suffice for now

    const packages = []

    // get what's needed from package.json
    const prodOnly = this.args.production || this.args.prod || process.env.NODE_ENV === 'production'
    const { deps, devDeps } = await pkgJsonUtil.read()
    packages.push(...deps)
    if (!prodOnly) {
      packages.push(...devDeps)
    }

    // catch any packages on the command line
    if (this.args._.length > 3) {
      packages.push(...this.args._.slice(3)) // args._[2] === 'add'
    }

    return packages
  }

  async getRegistry () {
    return new Promise((resolve, reject) => {
      execFile('yarn', ['config', 'get', 'registry'], { shell: true }, (e, stdout) => {
        if (e) return reject(e)
        if (!stdout) return reject(new Error('failed to determine registry'))
        return resolve(stdout.trim())
      })
    })
  }

  getLanguage () {
    return 'javascript'
  }

  getVersion () {
    return new Promise((resolve, reject) => {
      execFile('yarn', ['-v'], { shell: true }, (e, stdout) => {
        if (e) return reject(e)
        if (!stdout) return reject(new Error('failed to determine yarn version'))
        return resolve(`yarn@${stdout.trim()}`)
      })
    })
  }
}

module.exports = Yarn
