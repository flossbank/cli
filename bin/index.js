const fs = require('fs')
const {spawn} = require('child_process')

const {compensate} = require('../lib/compensate')

// use js to check if package json exists
const packageJsonPath = './package.json'
try {
  if (fs.existsSync(packageJsonPath)) {
    // We have a package json, scrape it and potentially log it
    fs.readFile(packageJsonPath, 'utf8', (err, data) => {
      if (err) return
      console.log(data)
      compensate()
    })
  }
} catch (e) {
  // do nothing or log that we couldn't read the package json
  console.log('error reading file', e)
}


// run npm install like normal and let them error handle
const inputCommands = process.argv
inputCommands.splice(0, 2)
// Command will be the first argument typed, such as 'npm' in 'npm install react'
const commandToExecute = inputCommands.splice(0, 1)[0]
// Arguments will be the remaining inputs, such as ['install', 'react'] in 'npm install react'
const arguments = inputCommands
try {
  const install = spawn(commandToExecute, arguments)
  install.stdout.on('data', data => {
    console.log('result:', data.toString())
  })

  install.stderr.on('data', data => {
    console.log('error: ', data)
  })

  install.on('close', code => {
    console.log('done, code: ', code)
  })
} catch (e) {
  console.log(`Error executing ${commandToExecute}`, e)
}
