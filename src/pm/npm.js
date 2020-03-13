const { supportsColor } = require('chalk')
const { spawn, execFile } = require('child_process')
const parseArgs = require('minimist')
const readPackageJson = require('../util/readPackageJson')

exports.start = async function ({ silent }, cb) {
  if (!silent) {
    return spawn('npm', process.argv.slice(2), { stdio: 'inherit', shell: true })
  }
  if (supportsColor) {
    process.env.FORCE_COLOR = 3
  }
  const child = spawn('npm', process.argv.slice(2), { shell: true })
  child.on('error', (err) => cb(err))
  child.on('exit', (code) => cb(null, { exit: true, code }))
  child.stdout.on('data', (chunk) => cb(null, { stdout: chunk }))
  child.stderr.on('data', (chunk) => cb(null, { stderr: chunk }))
}

exports.isSupportedVerb = function (cmd) {
  // confirm that the command being run is a supported form:
  //   npm install <optional pkgs here>
  //   npm i <optional pkgs here>
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

exports.getRegistry = async function () {
  return new Promise((resolve, reject) => {
    execFile('npm', ['config', 'get', 'registry'], { shell: true }, (e, stdout) => {
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
    execFile('npm', ['-v'], { shell: true }, (e, stdout) => {
      if (e) return reject(e)
      if (!stdout) return reject(new Error('failed to determine npm version'))
      return resolve(`npm@${stdout.trim()}`)
    })
  })
}
