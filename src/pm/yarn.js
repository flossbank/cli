const { execFile } = require('child_process')
const parseArgs = require('minimist')
const readPackageJson = require('../util/readPackageJson')

class Yarn {
  static isSupportedVerb (cmd) {
    // confirm that the command being run is a supported form:
    //   yarn
    //   yarn install
    //   yarn add <optional pkgs here>
    const verbs = new Set(['install', 'add'])
    const split = cmd.split(' ')
    if (split.length === 1 && split[0] === 'yarn') return true
    return split.length >= 2 && verbs.has(split[1])
  }

  static async getTopLevelPackages () {
    // yarn seems to install all dependencies in all cases (except prod=prod only)
    // rules we will use (for now)
    //   if format is `yarn add pkg1...pkgN`, send those pkgs + package.json.deps + devDeps
    //   if format is `yarn` or `yarn install`, send package.json.deps + devDeps
    //   if `--production`, send package.json.deps
    // yarn logic is slightly different than this depending on the presence
    // of a yarn.lock, but i think this will suffice for now

    const args = parseArgs(process.argv.slice(2))
    const packages = []

    // get what's needed from package.json
    const prodOnly = args.production || process.env.NODE_ENV === 'production'
    const { deps, devDeps } = await readPackageJson()
    packages.push(...deps)
    if (!prodOnly) {
      packages.push(...devDeps)
    }

    // catch any packages on the command line
    if (args._.length > 1) {
      packages.push(...args._.slice(1)) // args._[0] === 'add'
    }

    return packages
  }

  static async getRegistry () {
    return new Promise((resolve, reject) => {
      execFile('yarn', ['config', 'get', 'registry'], { shell: true }, (e, stdout) => {
        if (e) return reject(e)
        if (!stdout) return reject(new Error('failed to determine registry'))
        return resolve(stdout.trim())
      })
    })
  }

  static getLanguage () {
    return 'javascript'
  }

  static getVersion () {
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
