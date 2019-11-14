const { spawn, execFile } = require('child_process')
const parseArgs = require('minimist')
const readPackageJson = require('../util/readPackageJson')

exports.start = async function ({ silent }, done) {
  if (!silent) {
    return spawn('npm', process.argv.slice(2), { stdio: 'inherit' })
    // for offline testing: return spawn('ping', ['-c', '5', '127.0.0.1'], { stdio: 'inherit' })
  }
  return execFile('npm', process.argv.slice(2), done)
  // for offline testing: return execFile('ping', ['-c', '5', '127.0.0.1'], done)
}

exports.isSupportedVerb = function (cmd) {
  const split = cmd.split(' ')
  return split.length >= 2 && (split[1] === 'install' || split[1] === 'i')
}

exports.getTopLevelPackages = async function () {
  // for simplicity sake:
  //   if format is `npm install package1...packageN`, send those pkgs
  //   if format is `npm install`, send package.json.deps + devDeps
  //   if format is `npm install --only=prod`, send package.json.deps
  // npm logic is slightly different than this depending on the presence
  // of a package-lock.json, but i think this will suffice for now

  const args = parseArgs(process.argv.slice(2))

  // this is the `npm install` case
  if (args._.length === 1) {
    const prodOnly = args.production || args.only === 'prod' || process.env.NODE_ENV === 'production'
    const { deps, devDeps } = await readPackageJson()
    return prodOnly ? deps : deps.concat(devDeps)
  }

  // this is the `npm install package1...packageN` case
  return args._.slice(1) // args._[0] === 'install'
}
