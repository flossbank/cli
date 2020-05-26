const os = require('os')
const path = require('path')
const stream = require('stream')
const util = require('util')
const fs = require('fs')
const { spawn } = require('child_process')
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

    this.shouldUpdate = false
    this.latestVersion = ''
    this.latestReleaseUrl = ''
  }

  getBinDir () {
    const installDir = this.config.getInstallDir()
    return path.join(installDir, 'bin')
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
    const tempDir = tempy.directory()
    await pipeline(
      got.stream(latestReleaseUrl),
      fs.createWriteStream(zip)
    )
    if (os.platform() === 'win32') {
      // for windows, we will extract the new `flossbank` binary to a temp dir
      // and then spawn a small script that waits for this instance of `flossbank`
      // to exit, replaces with the new version, and then deletes itself
      await decompress(zip, tempDir, { plugins: [decompressUnzip()] })

      return this.windowsUpdate({ newVersionDir: tempDir })
    }
    // non-windows OS is fine with replacing the running file
    return decompress(zip, this.getBinDir(), { plugins: [decompressUnzip()] })
  }

  async windowsUpdate ({ newVersionDir }) {
    const scriptContents = [ // yes it's hacky
      ':Repeat', // label which allows for `goto` directives
      'del %1', // delete the file specified in 1st arg
      'if exist %1 goto Repeat', // if the file wasn't deleted, try again
      'move %2 %1', // now that we know 1st arg is gone, move 2nd arg into 1st args path
      'del %0' // delete self
    ]
    const scriptFile = tempy.file()
    await fs.promises.writeFile(scriptFile, scriptContents.join(os.EOL))

    const newBinary = path.join(newVersionDir, 'flossbank.exe')
    const oldBinary = path.join(this.getBinDir(), 'flossbank.exe')

    spawn(scriptFile, [oldBinary, newBinary], {
      detached: true,
      stdio: 'ignore',
      shell: true
    }).unref()
  }
}

module.exports = UpdateController
