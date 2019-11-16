const { spawn, execFile } = require('child_process')
const parseArgs = require('minimist')
const readPackageJson = require('../util/readPackageJson')

exports.start = async function ({ silent }, done) {
  if (!silent) {
    return spawn('yarn', process.argv.slice(2), { stdio: 'inherit' })
  }
  return execFile('yarn', process.argv.slice(2), done)
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
