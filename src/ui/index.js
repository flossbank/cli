const readline = require('readline')
const color = require('kleur')
const Diffy = require('diffy')
const format = require('./format')
const summary = require('./summary')
const { AD_INTERVAL, USAGE } = require('../constants')
const { version } = require('../../package.json')
const { sleep } = require('../util')

const getSpinner = (runtime) => ['|', '/', '-', '\\'][Math.floor(runtime * 10) % 4]

class Ui {
  constructor ({ config, client, runlog, stdout }) {
    this.config = config
    this.runlog = runlog
    this.client = client
    this.interval = AD_INTERVAL
    this.stdout = stdout

    this.pmOutput = Buffer.alloc(0)
    this.pmDone = false
    this.pmError = null

    this.diffy = null
    this.renderInterval = null

    this.showPmOutput = false
    this.canToggle = true

    this.runtime = 0 // seconds since starting ads
  }

  getExecString (pmCmd) {
    const suffix = this.pmDone ? '...done!' : '.'.repeat(Math.floor(this.runtime % 6))
    return this.showPmOutput
      ? `${this.getToggleString()}${suffix}`
      : `Flossbank is executing ${color.bold(pmCmd)}${suffix}`
  }

  getToggleString () {
    return this.showPmOutput
      ? 'Press any key to show ads instead of command output'
      : 'Press any key to show command output instead of ads'
  }

  toggle () {
    if (!this.canToggle) {
      return
    }
    this.showPmOutput = !this.showPmOutput
    this.render()
  }

  init () {
    if (this.diffy || this.runlog.enabled) { // no diffy if in debug mode
      return
    }
    this.diffy = Diffy()
    const diffy = this.diffy
    diffy.render(() => this.getExecString())
    this.renderInterval = setInterval(() => {
      this.runtime += 0.1
      diffy.render()
    }, 100)
    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.on('keypress', (_, key) => {
      if (key && key.ctrl && key.name === 'c') {
        process.exit()
      }
      this.toggle()
    })
  }

  tearDown () {
    if (!this.runlog.enabled) {
      process.stdin.setRawMode(false)
      clearInterval(this.renderInterval)

      // if currently showing ads, delete the ad and replace with pm output
      this.diffy.render(() => '')
      this.diffy.destroy()
      this.stdout.write(this.pmOutput)
    }
  }

  render (renderFn) {
    if (this.runlog.enabled) { // nothing to render if in debug mode
      return
    }
    this.diffy.render(renderFn)
  }

  async startAds ({ pmCmd }) {
    this.init()

    while (!this.pmDone) {
      let formattedAd = ''
      if (!this.showPmOutput) { // only get/format an ad if someone is looking
        const ad = await this.client.getAd()
        if (!ad) {
          this.handleNoAds()
          continue
        }
        this.runlog.debug('showing ad: %O', ad)
        formattedAd = format(ad)
      }

      this.render(() => {
        return this.showPmOutput
          ? `${this.pmOutput.length ? this.pmOutput : `${getSpinner(this.runtime)} ${this.getExecString(pmCmd)}`}`
          : `${getSpinner(this.runtime)} ${this.getExecString(pmCmd)}\n${formattedAd}\n${this.getToggleString()}`
      })
      await sleep(this.interval)
    }

    this.tearDown()
  }

  handleNoAds () {
    this.runlog.debug('no ads to show, disabling toggling')
    this.canToggle = false
    this.showPmOutput = true
    this.render()
  }

  printSummary () {
    this.runlog.debug('package manager complete; printing output')
    if (this.pmError) {
      console.error(typeof this.pmError === 'number' ? `Exit code: ${this.pmError}` : this.pmError)
    }
    const adsSummary = summary(this.client.getSeenAds())
    if (adsSummary) { console.log(adsSummary) }
  }

  setPmOutput (error, stdout, stderr) {
    if (stdout || stderr) {
      this.pmOutput = Buffer.concat([this.pmOutput, stdout || stderr])
    } else if (error) {
      this.pmDone = true
      this.pmError = error
    }
  }

  setPmDone (code) {
    if (code) {
      this.pmError = code
    }
    this.pmDone = true
  }

  sayGoodbye () {
    console.log(color.white().bold('\nThanks for supporting the Open Source community with Flossbank ♥'))
  }

  printHelp () {
    console.log(`  Flossbank v${version}\n${USAGE}`)
  }

  printVersion () {
    console.log(version)
  }

  info (msg) {
    console.log(color.white().bold(msg))
  }

  warn (msg) {
    console.log(color.yellow(msg))
  }

  error (msg) {
    console.log(color.red(msg))
  }
}

module.exports = Ui
