const { execFile } = require('child_process')
const pkgJsonUtil = require('../util/readPackageJson')
const nopt = require('nopt')
const { shorthands, types } = require('npm/lib/config/defaults')

class Npm {
  constructor (args) {
    this.flags = nopt(types, shorthands, args)
    this.argv = this.flags.argv.remain
    this.verbs = new Set(['install', 'i', 'add'])
  }

  isSupportedVerb () {
    return this.verbs.has(this.argv[0])
  }

  isQuietMode () {
    return ['warn', 'silent'].includes(this.flags.logLevel)
  }

  async getTopLevelPackages () {
    const pkgs = this.argv.slice(1) // everything but the 'command'
    if (!pkgs.length) {
      const prodOnly = typeof this.flags.only === 'string' && this.flags.only.startsWith('prod')
      const prodEnv = process.env.NODE_ENV === 'production'
      const excludeDevDeps = prodOnly || prodEnv
      const { deps, devDeps } = await pkgJsonUtil.read()
      pkgs.push(...(excludeDevDeps ? deps : deps.concat(devDeps)))
    }
    return pkgs
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
