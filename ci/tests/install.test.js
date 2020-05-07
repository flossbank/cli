const test = require('ava')
const { fs: { readFile } } = require('./util/_common')
const flossbank = require('./util/_flossbank')

test.serial('integ: install to shell profiles', async (t) => {
  const runlog = await flossbank.run(['install'])

  const profilePaths = [
    ...runlog.detectedShellFormatProfiles,
    ...runlog.detectedPowerFormatProfiles
  ]
  t.true(profilePaths.length > 0)
  t.log('profile paths:', profilePaths)
  const profiles = await Promise.all(profilePaths.map(profile => readFile(profile)))

  t.true(profiles.every(profile => profile.includes('flossbank_aliases')))
  t.log('after install all shell profiles were found sourcing flossbank aliases')
})

test.serial('integ: uninstall from shell profiles', async (t) => {
  const runlog = await flossbank.run(['uninstall'])

  const profilePaths = [
    ...runlog.detectedShellFormatProfiles,
    ...runlog.detectedPowerFormatProfiles
  ]
  t.true(profilePaths.length > 0)
  t.log('profile paths:', profilePaths)
  const profiles = await Promise.all(profilePaths.map(profile => readFile(profile)))

  t.true(profiles.every(profile => !profile.includes('flossbank_aliases')))
  t.log('after uninstall no shell profiles were found sourcing flossbank aliases')
})
