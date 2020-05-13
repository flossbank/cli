const test = require('ava')
const { fs: { readFile } } = require('./util/_common')
const flossbank = require('./util/_flossbank')

test.serial('integ: install to shell profiles', async (t) => {
  const runlog = await flossbank.run(['install', '/tmp/.flossbank'])

  const profilePaths = [
    ...runlog.detectedShellFormatProfiles,
    ...runlog.detectedPowerFormatProfiles
  ]
  t.true(profilePaths.length > 0)
  t.log('profile paths:', profilePaths)
  const profiles = await Promise.all(profilePaths.map(profile => readFile(profile)))

  t.true(profiles.every(profile => profile.includes('.flossbank')))
  t.log('after install all shell profiles were found sourcing flossbank env')
})

test.serial('integ: uninstall from shell profiles', async (t) => {
  const runlog = await flossbank.run(['uninstall', '/tmp/.flossbank/env'])

  const profilePaths = [
    ...runlog.detectedShellFormatProfiles,
    ...runlog.detectedPowerFormatProfiles
  ]
  t.true(profilePaths.length > 0)
  t.log('profile paths:', profilePaths)
  const profiles = await Promise.all(profilePaths.map(profile => readFile(profile)))

  t.true(profiles.every(profile => !profile.includes('.flossbank')))
  t.log('after uninstall no shell profiles were found sourcing flossbank env')
})
