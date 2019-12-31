const fs = require('fs')
const os = require('os')
const path = require('path')

// ideas from https://github.com/nvm-sh/nvm/blob/master/install.sh
module.exports = () => {
  const detectedProfiles = []
  if (process.env.PROFILE && fs.existsSync(process.env.PROFILE)) {
    detectedProfiles.push(process.env.PROFILE)
  }

  if (process.env.BASH_VERSION) {
    const bashRc = path.join(os.homedir(), '.bashrc')
    const bashProf = path.join(os.homedir(), '.bash_profile')
    if (fs.existsSync(bashRc)) {
      detectedProfiles.push(bashRc)
    } else if (fs.existsSync(bashProf)) {
      detectedProfiles.push(bashProf)
    }
  } else if (process.env.ZSH_VERSION) {
    detectedProfiles.push(path.join(os.homedir(), '.zshrc'))
  }

  if (!detectedProfiles.length) {
    for (const prof of ['.profile', '.bashrc', '.bash_profile', '.zshrc']) {
      const profPath = path.join(os.homedir(), prof)
      if (fs.existsSync(profPath)) {
        detectedProfiles.push(profPath)
      }
    }
  }

  if (!detectedProfiles.length) {
    throw new Error('Profile not found.')
  }
  return detectedProfiles
}
