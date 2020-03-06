const { supportsColor } = require('chalk')
const { spawn, execFile } = require('child_process')
const parseArgs = require('minimist')
const readPackageJson = require('../util/readPackageJson')

exports.start = async function ({ silent }, cb) {
  if (!silent) {
    return spawn('yarn', process.argv.slice(2), { stdio: 'inherit' })
  }
  if (supportsColor) {
    process.env.FORCE_COLOR = 3
  }
  const child = spawn('yarn', process.argv.slice(2))
  child.on('error', (err) => cb(err))
  child.on('exit', (code) => cb(null, { exit: true, code }))
  child.stdout.on('data', (chunk) => cb(null, { stdout: chunk }))
  child.stderr.on('data', (chunk) => cb(null, { stderr: chunk }))
}

exports.isSupportedVerb = function (cmd) {
  // confirm that the command being run is a supported form:
  //   yarn
  //   yarn install
  //   yarn add <optional pkgs here>
  const verbs = new Set(['install', 'add'])
  const split = cmd.split(' ')
  if (split.length === 1 && split[0] === 'yarn') return true
  return split.length >= 2 && verbs.has(split[1])
}

exports.getTopLevelPackages = async function () {
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

exports.getRegistry = async function () {
  return new Promise((resolve, reject) => {
    execFile('yarn', ['config', 'get', 'registry'], (e, stdout) => {
      if (e) return reject(e)
      if (!stdout) return reject(new Error('failed to determine registry'))
      return resolve(stdout.trim())
    })
  })
}

exports.getLanguage = async function () {
  return 'javascript'
}

exports.getVersion = async function () {
  return new Promise((resolve, reject) => {
    execFile('yarn', ['-v'], (e, stdout) => {
      if (e) return reject(e)
      if (!stdout) return reject(new Error('failed to determine yarn version'))
      return resolve(`yarn@${stdout.trim()}`)
    })
  })
}
