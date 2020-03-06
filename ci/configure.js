const path = require('path')
const { writeFileSync } = require('fs')
const { execFile } = require('child_process')

const INTEG_TEST_KEY = 'cf667c9381f7792bfa772025ff8ee93b89d9a757e6732e87611a0c34b48357d1'

function writeApiKey () {
  return new Promise((resolve, reject) => {
    execFile('node', ['bin.js', 'source'], (err, stdout) => {
      if (err) reject(err)
      if (!stdout) reject(Error('no source found'))
      const configFile = path.resolve(stdout.trim(), '../config.json')
      const config = require(configFile)
      writeFileSync(configFile, JSON.stringify(Object.assign({}, config, {
        apiKey: INTEG_TEST_KEY
      }), null, 4))
      resolve()
    })
  })
}

async function main () {
  await writeApiKey()
}

main()
