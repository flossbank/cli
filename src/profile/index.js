const fs = require('fs')
const os = require('os')
const path = require('path')
const encoding = require('./encoding')
const { exec } = require('child_process')
const makeDir = require('make-dir')
const { readFileAsync, writeFileAsync, openAsync, closeAsync } = require('../util/asyncFs')

function inHome (...filepaths) {
  return path.join(os.homedir(), ...filepaths)
}

function inConfig (...filepaths) {
  return inHome('.config', ...filepaths)
}

const SUPPORTED_SHELLS = {
  shellFormat: {
    sh: [inHome('.profile')],
    csh: [inHome('.cshrc')],
    tcsh: [inHome('.tcshrc')],
    ksh: [inHome('.kshrc')],
    zsh: [inHome('.zshrc')],
    bash: [inHome('.bashrc'), inHome('.bash_profile')]
  },
  powerFormat: {
    pwsh: os.platform() !== 'win32' // pwsh stores its profile in different places depending on the OS
      ? [inConfig('powershell', 'Microsoft.PowerShell_profile.ps1')]
      : [inHome('Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1')],
    'powershell.exe': [inHome('Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1')]
  }
}

/**
 * Profile is responsible for detecting appropriate shell profile files and appending/removing the
 *  source command to/from those shell profiles. Profile attempts to run many different shell variants
 *  to determine the appropriate paths to write to. Shells which are runnable are eligible to have their
 *  respective profiles updated with the source command.
 */
class Profile {
  constructor ({ alias, runlog }) {
    this.alias = alias
    this.runlog = runlog
  }

  async installToProfiles () {
    return this._updateProfiles({ install: true })
  }

  async uninstallFromProfiles () {
    return this._updateProfiles({ uninstall: true })
  }

  async _updateProfiles ({ install, uninstall }) {
    const { detectedShellFormatProfiles, detectedPowerFormatProfiles } = await this._detectProfiles()

    this.runlog.record('detectedShellFormatProfiles', detectedShellFormatProfiles)
    this.runlog.record('detectedPowerFormatProfiles', detectedPowerFormatProfiles)

    const shellProfiles = await this._readProfiles(detectedShellFormatProfiles)
    const powerProfiles = await this._readProfiles(detectedPowerFormatProfiles)

    await Promise.all(
      shellProfiles.map(profile => {
        if (install) this._appendLineToProfile(profile, this.alias.getShellSourceCommand())
        if (uninstall) this._removeLineFromProfile(profile, this.alias.getShellSourceCommand())
      })
    )
    await Promise.all(
      powerProfiles.map(profile => {
        if (install) this._appendLineToProfile(profile, this.alias.getPowerSourceCommand())
        if (uninstall) this._removeLineFromProfile(profile, this.alias.getPowerSourceCommand())
      })
    )
  }

  async _appendLineToProfile (profile, line) {
    const { contents } = profile
    if (contents.includes(line)) return // don't double add
    return writeFileAsync(profile.path, `${contents}${this._pad(line)}`, { encoding: profile.encoding })
  }

  async _removeLineFromProfile (profile, line) {
    const { contents } = profile
    if (!contents.includes(line)) return // nothing to remove
    const cleanProfile = contents.split(os.EOL).filter(existingLine => existingLine !== line).join(os.EOL)
    return writeFileAsync(profile.path, cleanProfile, { encoding: profile.encoding })
  }

  async _detectProfiles () {
    const detectedShellFormatProfiles = new Set()
    const detectedPowerFormatProfiles = new Set()

    const shellFormat = Object.keys(SUPPORTED_SHELLS.shellFormat).map(async shell => {
      const runnable = await this._isRunnable(shell)
      return ({
        shell,
        runnable,
        profiles: SUPPORTED_SHELLS.shellFormat[shell]
      })
    })
    const powerFormat = Object.keys(SUPPORTED_SHELLS.powerFormat).map(async shell => {
      const runnable = await this._isRunnable(shell)
      return ({
        shell,
        runnable,
        profiles: SUPPORTED_SHELLS.powerFormat[shell]
      })
    })

    ;(await Promise.all(shellFormat)).filter(res => res.runnable).forEach(sh => {
      detectedShellFormatProfiles.add(...sh.profiles)
    })
    ;(await Promise.all(powerFormat)).filter(res => res.runnable).forEach(sh => {
      detectedPowerFormatProfiles.add(...sh.profiles)
    })

    return {
      detectedShellFormatProfiles: [...detectedShellFormatProfiles],
      detectedPowerFormatProfiles: [...detectedPowerFormatProfiles]
    }
  }

  async _readProfiles (profilePaths) {
    const profiles = await Promise.all(profilePaths.map(profilePath => this._readOrCreateProfile(profilePath)))
    return profiles.filter(profile => !!profile) // filter out null profiles (unsupported encoding)
  }

  async _readOrCreateProfile (profilePath) {
    if (!await this._fileExists(profilePath)) {
      await this._createProfile(profilePath)
      this.runlog.debug('creating blank profile %o', profilePath)
      // for brand new empty profiles, we can choose the encoding
      return { path: profilePath, contents: '', encoding: 'utf8' }
    }
    const fileBuffer = await readFileAsync(profilePath)
    const detectedEncoding = await encoding.detectEncodingFromBuffer(fileBuffer)
    if (detectedEncoding.seemsBinary || !encoding.encodingExists(detectedEncoding.encoding)) {
      // we can't safely read/write from this file, so we will skip it
      return null
    }
    const fileContents = encoding.decode(fileBuffer, detectedEncoding.encoding)
    return { path: profilePath, contents: fileContents, encoding: detectedEncoding.encoding }
  }

  async _createProfile (profilePath) {
    await makeDir(path.resolve(profilePath, '..'))
    // we don't need the file descriptor, so immediately close the file
    return closeAsync(await openAsync(profilePath, 'a')) // `a` flag opens file for appending; creates empty if it doesn't exist
  }

  _isRunnable (sh) {
    return new Promise((resolve) => {
      exec(`${sh} -c "echo hello"`, (err, stdout, stderr) => {
        if (err) return resolve(false)
        if (![stdout, stderr].some(out => out.includes('hello'))) return resolve(false)
        resolve(true)
      })
    })
  }

  _fileExists (filePath) {
    return new Promise((resolve) => {
      fs.access(filePath, (err) => resolve(!err))
    })
  }

  _pad (something) {
    return `${os.EOL}${something}${os.EOL}`
  }
}

module.exports = Profile
