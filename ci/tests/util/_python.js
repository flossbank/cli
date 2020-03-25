const { exec, fs: { ls, rm } } = require('./_common')

let pythonDepDir

async function resolvePythonDepDir () {
  if (pythonDepDir) return pythonDepDir

  const { stdout } = await exec('python', ['-m', 'site', '--user-site'])
  pythonDepDir = stdout.trim()

  return pythonDepDir
}

module.exports = {
  getPythonPkgs: async () => ls(`${await resolvePythonDepDir()}/*`).map(dir => dir.name),
  deletePythonPkgs: async () => rm(`${await resolvePythonDepDir()}/*`)
}
