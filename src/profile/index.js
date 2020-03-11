const fs = require('fs')
const os = require('os')
const path = require('path')
const { readFileAsync, writeFileAsync } = require('../util/asyncFs')

class Profile {
  async addToProfiles (data) {
    return this._updateProfiles(
      prof => !prof.profile.includes(data),
      prof => prof.profile + this._pad(data)
    )
  }

  async removeFromProfiles (data) {
    return this._updateProfiles(
      prof => prof.profile.includes(data),
      prof => {
        const out = []
        for (const line of prof.profile.split(os.EOL)) {
          if (line !== data) { out.push(line) }
        }
        return out.join(os.EOL)
      }
    )
  }

  async _updateProfiles (predicate = () => false, updateFn = () => { }) {
    const profilePaths = await this._detectProfiles()
    const profiles = await Promise.all(profilePaths
      .map(profPath => readFileAsync(profPath, 'utf8')
        .then((prof) => ({ profile: prof, path: profPath }))))
    const profilesToUpdate = profiles.filter(prof => predicate(prof))
    if (!profilesToUpdate.length) { return }
    return Promise.all(profilesToUpdate.map(prof => writeFileAsync(prof.path, updateFn(prof))))
  }

  async _detectProfiles () {
    // ideas from https://github.com/nvm-sh/nvm/blob/master/install.sh
    const detectedProfiles = []
    if (process.env.PROFILE && await this._fileExists(process.env.PROFILE)) {
      detectedProfiles.push(process.env.PROFILE)
    }

    if (process.env.BASH_VERSION) {
      const bashRc = path.join(os.homedir(), '.bashrc')
      const bashProf = path.join(os.homedir(), '.bash_profile')
      if (await this._fileExists(bashRc)) {
        detectedProfiles.push(bashRc)
      } else if (await this._fileExists(bashProf)) {
        detectedProfiles.push(bashProf)
      }
    } else if (process.env.ZSH_VERSION) {
      detectedProfiles.push(path.join(os.homedir(), '.zshrc'))
    }

    if (!detectedProfiles.length) {
      for (const prof of ['.profile', '.bashrc', '.bash_profile', '.zshrc']) {
        const profPath = path.join(os.homedir(), prof)
        if (await this._fileExists(profPath)) {
          detectedProfiles.push(profPath)
        }
      }
    }

    if (!detectedProfiles.length) {
      throw new Error('Profile not found.')
    }
    return detectedProfiles
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
