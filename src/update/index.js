const os = require('os')
const path = require('path')
const stream = require('stream')
const util = require('util')
const fs = require('fs')
const tempy = require('tempy')
const decompress = require('decompress')
const decompressUnzip = require('decompress-unzip')
const got = require('got')
const { version } = require('../../package.json')

const pipeline = util.promisify(stream.pipeline)

class UpdateController {
  constructor ({ tempWriter, config, runlog }) {
    this.tempWriter = tempWriter
    this.config = config
    this.runlog = runlog

    const installDir = this.config.getInstallDir()
    this.binDir = path.join(installDir, 'bin')

    this.shouldUpdate = false
    this.latestVersion = ''
    this.latestReleaseUrl = ''
  }

  getTarget () {
    switch (os.platform()) {
      case 'darwin':
        return 'macos-x86_64'
      case 'linux':
        return 'linux-x86_64'
      case 'win32':
        return 'win-x86_64'
      default:
        throw new Error('unsupported platform; cannot auto update')
    }
  }

  async getLatestVersion () {
    const url = `${this.config.getInstallHost()}/releases/${this.getTarget()}`
    const latest = await got(url, { resolveBodyOnly: true })
    const [latestReleaseUrl, latestVersion] = latest.split('\n')

    this.shouldUpdate = `v${version}` !== latestVersion
    this.latestReleaseUrl = latestReleaseUrl
    this.latestVersion = latestVersion
    this.runlog.debug('latestVersion: %o', latestVersion)

    return { shouldUpdate: this.shouldUpdate, latestReleaseUrl, latestVersion }
  }

  async update () {
    if (!this.shouldUpdate) {
      const { shouldUpdate } = await this.getLatestVersion()
      if (!shouldUpdate) return
    }
    const { latestReleaseUrl } = this

    const zip = tempy.file()
    await pipeline(
      got.stream(latestReleaseUrl),
      fs.createWriteStream(zip)
    )
    await decompress(zip, this.binDir, { plugins: [decompressUnzip()] })
  }
}

module.exports = UpdateController
