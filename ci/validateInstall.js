const os = require('os')
const { readFileSync } = require('fs')
const assert = require('assert')

const encoding = os.platform() === 'win32' ? 'utf16le' : 'utf8'
const output = readFileSync('./ci/install_log.txt', encoding).split(os.EOL)

assert.ok(output.find(line => line.includes('flossbank running package manager with ads')))
assert.ok(output.find(line => line.includes('flossbank showing ad')))
assert.ok(output.find(line => line.includes('flossbank completing session with these ad ids')))

console.log('Installation with ads validated')
