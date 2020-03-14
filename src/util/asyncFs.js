const fs = require('fs')
const { promisify } = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const openAsync = promisify(fs.open)
const closeAsync = promisify(fs.close)

module.exports = { readFileAsync, writeFileAsync, openAsync, closeAsync }
