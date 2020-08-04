const {
  createWriteStream,
  createReadStream,
  promises: {
    readFile,
    writeFile,
    open,
    access
  }
} = require('fs')
const { exec } = require('child_process')
const os = require('os')
const path = require('path')
const makeDir = require('make-dir')

/**
 * Profile is responsible for detecting appropriate shell profile files and appending/removing the
 *  source command to/from those shell profiles. Profile attempts to run many different shell variants
 *  to determine the appropriate paths to write to. Shells which are runnable are eligible to have their
 *  respective profiles updated with the source command.
 */
class Profile {
  constructor ({ env, runlog }) {
    this.env = env
    this.runlog = runlog
    this.SUPPORTED_SHELLS = {
      shellFormat: {
        // only support shells that support functions
        // ref: https://web.archive.org/web/20160403120601/http://www.unixnote.com/2010/05/different-unix-shell.html
        sh: [this.inHome('.profile')],
        ksh: [this.inHome('.kshrc')],
        zsh: [this.inHome('.zshrc'), this.inHome('.profile'), this.inHome('.zprofile')],
        bash: [this.inHome('.bashrc'), this.inHome('.profile'), this.inHome('.bash_profile')]
      },
      powerFormat: {
        pwsh: os.platform() !== 'win32' // pwsh stores its profile in different places depending on the OS
          ? [this.inConfig('powershell', 'Microsoft.PowerShell_profile.ps1')]
          : [this.inHome('Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1')],
        'powershell.exe': [this.inHome('Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1')]
      }
    }
  }

  inHome (...filepaths) {
    return path.join(os.homedir(), ...filepaths)
  }

  inConfig (...filepaths) {
    return this.inHome('.config', ...filepaths)
  }

  // shells and an appropriate config file to add our source line to
  // ref: https://en.wikipedia.org/wiki/Unix_shell#Configuration_files

  async installToProfiles () {
    return this._updateProfiles({ install: true })
  }

  async uninstallFromProfiles () {
    return this._updateProfiles({ uninstall: true })
  }

  async _updateProfiles ({ install, uninstall }) {
    const { detectedShellFormatProfiles, detectedPowerFormatProfiles } = await this._detectProfiles()

    this.runlog.record(this.runlog.keys.DETECTED_SHELL_PROFILES, detectedShellFormatProfiles)
    this.runlog.record(this.runlog.keys.DETECTED_POWER_PROFILES, detectedPowerFormatProfiles)

    await this._backupProfiles([...detectedShellFormatProfiles, ...detectedPowerFormatProfiles])

    const shellProfiles = await this._readProfiles(detectedShellFormatProfiles)
    const powerProfiles = await this._readProfiles(detectedPowerFormatProfiles)

    await Promise.all(
      shellProfiles.map(profile => {
        if (install) return this._appendLineToProfile(profile, this.env.getShellSourceCommand())
        if (uninstall) return this._removeLineFromProfile(profile, this.env.getShellSourceCommand())
      })
    )
    await Promise.all(
      powerProfiles.map(profile => {
        if (install) return this._appendLineToProfile(profile, this.env.getPowerSourceCommand())
        if (uninstall) return this._removeLineFromProfile(profile, this.env.getPowerSourceCommand())
      })
    )
  }

  async _appendLineToProfile (profile, line) {
    const { contents } = profile
    if (contents.includes(line)) return // don't double add
    return writeFile(profile.path, this._pad(contents, line), { flag: 'a' }) // append
  }

  async _removeLineFromProfile (profile, line) {
    const { contents } = profile
    if (!contents.includes(line)) return // nothing to remove
    const cleanProfile = contents.split(os.EOL).filter(existingLine => existingLine !== line).join(os.EOL)
    return writeFile(profile.path, cleanProfile)
  }

  async _detectProfiles () {
    const detectedShellFormatProfiles = new Set()
    const detectedPowerFormatProfiles = new Set()

    const shellFormat = Object.keys(this.SUPPORTED_SHELLS.shellFormat).map(async shell => {
      const runnable = await this._isRunnable(shell)
      return ({
        shell,
        runnable,
        profiles: this.SUPPORTED_SHELLS.shellFormat[shell]
      })
    })
    const powerFormat = Object.keys(this.SUPPORTED_SHELLS.powerFormat).map(async shell => {
      const runnable = await this._isRunnable(shell)
      return ({
        shell,
        runnable,
        profiles: this.SUPPORTED_SHELLS.powerFormat[shell]
      })
    })

    ;(await Promise.all(shellFormat)).filter(res => res.runnable).forEach(sh => {
      sh.profiles.forEach(profile => detectedShellFormatProfiles.add(profile))
    })
    ;(await Promise.all(powerFormat)).filter(res => res.runnable).forEach(sh => {
      sh.profiles.forEach(profile => detectedPowerFormatProfiles.add(profile))
    })

    return {
      detectedShellFormatProfiles: [...detectedShellFormatProfiles],
      detectedPowerFormatProfiles: [...detectedPowerFormatProfiles]
    }
  }

  async _backupProfiles (profilePaths) {
    return Promise.all(profilePaths.map(profilePath => this._backupProfile(profilePath)))
  }

  async _backupProfile (profilePath) {
    if (!await this._fileExists(profilePath)) return
    const backupPath = `${profilePath}_flossbank_backup.bak`
    return new Promise((resolve) => {
      const stream = createReadStream(profilePath).pipe(createWriteStream(backupPath))
      stream.on('close', resolve)
    })
  }

  async _readProfiles (profilePaths) {
    return Promise.all(profilePaths.map(profilePath => this._readOrCreateProfile(profilePath)))
  }

  async _readOrCreateProfile (profilePath) {
    if (!await this._fileExists(profilePath)) {
      this.runlog.debug('unable to access %s', profilePath)
      await this._createProfile(profilePath)
      return { path: profilePath, contents: '' }
    }
    const contents = await readFile(profilePath, 'utf8')
    return { path: profilePath, contents }
  }

  async _createProfile (profilePath) {
    this.runlog.debug('creating blank profile %o', profilePath)
    await makeDir(path.resolve(profilePath, '..'))
    // we don't need the file descriptor, so immediately close the file
    return (await open(profilePath, 'a')).close() // `a` flag opens file for appending; creates empty if it doesn't exist
  }

  async _isRunnable (sh) {
    const runChecks = [
      new Promise((resolve) => {
        const child = exec(`command -v ${sh}`, (err) => {
          if (err) return resolve(false)
        })
        child.on('error', () => resolve(false))
        child.on('close', (code) => resolve(code === 0))
        child.on('exit', (code) => resolve(code === 0))
      }),
      new Promise((resolve) => {
        const child = exec(`where ${sh}`, (err) => {
          if (err) return resolve(false)
        })
        child.on('error', () => resolve(false))
        child.on('close', (code) => resolve(code === 0))
        child.on('exit', (code) => resolve(code === 0))
      }),
      new Promise((resolve) => {
        const child = exec(`Get-Command ${sh}`, (err) => {
          if (err) return resolve(false)
        })
        child.on('error', () => resolve(false))
        child.on('close', (code) => resolve(code === 0))
        child.on('exit', (code) => resolve(code === 0))
      })
    ]
    const runResults = await Promise.allSettled(runChecks) // Promise.any can't come soon enough
    return runResults.some(({ status, value }) => status === 'fulfilled' && value)
  }

  async _fileExists (filePath) {
    try {
      // access doesn't return `true` if the user can access `filePath`
      // instead, it throws if the answer is no
      await access(filePath)
      return true
    } catch (e) {
      return false
    }
  }

  _pad (profile, line) {
    const profileLines = profile.split(os.EOL)
    if (!profileLines[profileLines.length - 1]) { // blank line at end of profile
      return `${line}${os.EOL}`
    }
    return `${os.EOL}${line}${os.EOL}` // add a blank line between exiting content and line
  }
}

module.exports = Profile
