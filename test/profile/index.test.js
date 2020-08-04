
const test = require('ava')
const sinon = require('sinon')
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
  Profile.prototype.inHome = (...args) => args.pop()
  Profile.prototype.inConfig = (...args) => args.pop()
  t.context.profile = new Profile({ config, runlog })
})

test('writes to all shell and power profiles for system with all shells and power available', async (t) => {
  const { profile } = t.context
  profile._isRunnable = sinon.stub().returns(true)

  const {
    detectedShellFormatProfiles,
    detectedPowerFormatProfiles
  } = await profile._detectProfiles()
  t.deepEqual([
    '.profile',
    '.kshrc',
    '.zshrc',
    '.zprofile',
    '.bashrc',
    '.bash_profile'
  ], detectedShellFormatProfiles)
  t.deepEqual([
    'Microsoft.PowerShell_profile.ps1'
  ], detectedPowerFormatProfiles)
})
