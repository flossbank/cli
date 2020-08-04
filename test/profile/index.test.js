
const test = require('ava')
const sinon = require('sinon')
const os = require('os')
const Profile = require('../../src/profile')

test.beforeEach((t) => {
  const config = {
    getApiHost: () => 'http://localhost',
    getApiKey: () => 'api_key'
  }
  const runlog = {
    error: sinon.stub(),
    debug: sinon.stub(),
    record: sinon.stub(),
    keys: {}
  }
  sinon.stub(os, 'homedir').returns('')
  t.context.profile = new Profile({ config, runlog })
})

test('writes to all shell and power profiles for system with all shells and power available', async (t) => {
  const { profile } = t.context
  profile._isRunnable = sinon.stub().returns(true)

  const {
    detectedShellFormatProfiles,
    detectedPowerFormatProfiles
  } = await profile._detectProfiles()
  t.deepEqual(detectedShellFormatProfiles, [
    '.profile',
    '.kshrc',
    '.zshrc',
    '.zprofile',
    '.bashrc',
    '.bash_profile'
  ])
  t.deepEqual(detectedPowerFormatProfiles, [
    '.config/powershell/Microsoft.PowerShell_profile.ps1',
    'Documents/WindowsPowerShell/Microsoft.PowerShell_profile.ps1'
  ])
})
