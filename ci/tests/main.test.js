const test = require('ava')
const path = require('path')
const { execFile } = require('child_process')
const { readFile } = require('fs')

function getBinPath () {
  return path.resolve(process.cwd(), '../../', 'bin.js')
}

function runFlossbank (args) {
  return new Promise((resolve, reject) => {
    execFile('node', [getBinPath()].concat(args), (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim())
    })
  })
}

function getLastRunlog () {
  return new Promise((resolve, reject) => {
    execFile('node', [getBinPath(), 'runlog'], (err, stdout) => {
      if (err) return reject(err)
      if (!stdout) return reject(Error('no runlog found'))
      readFile(stdout.trim(), (err2, data) => {
        if (err2) return reject(err2)
        resolve(JSON.parse(data))
      })
    })
  })
}

test.before(() => {
  process.chdir(__dirname)
})

test.after.always((t) => {
  process.chdir(path.resolve(__dirname, '..'))
})

test.serial('run pm with ads', async (t) => {
  await runFlossbank(['npm', 'install'])
  const runlog = await getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'npm install')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})
