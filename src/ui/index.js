const readline = require('readline')
const chalk = require('chalk')
const Diffy = require('diffy')
const prompts = require('prompts')
const auth = require('./auth')
const format = require('./format')
const summary = require('./summary')
const { INTERVAL, USAGE } = require('../constants')
const { version } = require('../../package.json')

function Ui ({ config, runlog }) {
  this.config = config
  this.runlog = runlog
  this.interval = INTERVAL
  this.pmOutput = Buffer.alloc(0)
  this.pmDone = false
  this.pmError = null

  this.pmCmd = null
  this.getSeenAds = () => []
  this.doneShowingAds = async () => {}
  this.fetchAd = async () => {}

  this.runtime = 0
  this.diffy = null

  this.showPmOutput = false
  this.ad = ''
}

Ui.prototype.setPmCmd = function setPmCmd (pmCmd) {
  this.pmCmd = pmCmd
  return this
}

Ui.prototype.setCallback = function setCallback (cb) {
  this.doneShowingAds = cb
  return this
}

Ui.prototype.setGetSeenAds = function setGetSeenAds (fn) {
  this.getSeenAds = fn
  return this
}

Ui.prototype.setFetchAd = function setFetchAd (fn) {
  this.fetchAd = fn
  return this
}

Ui.prototype.getSpinner = function getSpinner () {
  return ['|', '/', '-', '\\'][Math.floor(this.runtime * 10) % 4]
}

Ui.prototype.getExecString = function getExecString () {
  const suffix = this.pmDone ? '...done!' : '.'.repeat(Math.floor(this.runtime % 6))
  return this.showPmOutput
    ? `${this.getToggleString()}${suffix}`
    : `Flossbank is executing ${chalk.bold(this.pmCmd)}${suffix}`
}

Ui.prototype.getToggleString = function getToggleString () {
  return this.showPmOutput
    ? 'Press any key to show ads instead of command output'
    : 'Press any key to show command output instead of ads'
}

Ui.prototype.toggle = function toggle () {
  this.showPmOutput = !this.showPmOutput
  this.diffy.render()
}

Ui.prototype.startAds = async function startAds () {
  if (!this.diffy && !this.runlog.enabled) {
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
  if (!this.pmDone) {
    let ad
    if (!this.showPmOutput) {
      try {
        ad = await this.fetchAd()
      } catch (e) {
        this.runlog.error('failed to fetch ad: %O', e)
        return this.failure()
      }
      if (!ad) return this.failure()
      this.ad = this.runlog.enabled ? ad : format(ad)
    }

    if (!this.runlog.enabled) {
      this.diffy.render(() => {
        return this.showPmOutput
          ? `${this.pmOutput.length ? this.pmOutput : `${this.getSpinner()} ${this.getExecString()}`}`
          : `${this.getSpinner()} ${this.getExecString()}\n${this.ad}\n${this.getToggleString()}`
      })
    } else {
      this.runlog.debug('showing ad: %O', ad)
    }
    setTimeout(() => this.startAds(), this.interval)
  } else {
    this.doneShowingAds()
    this.showCompletion()
  }
}

Ui.prototype.failure = async function failure () {
  if (!this.pmDone) {
    this.runlog.debug('package manager is not done yet; waiting to show completion message')
    setTimeout(() => this.failure(), 500)
    return
  }
  this.showCompletion()
}

Ui.prototype.showCompletion = async function showCompletion () {
  this.runlog.debug('package manager complete; printing output')
  if (!this.runlog.enabled) {
    process.stdin.setRawMode(false)
    clearInterval(this.renderInterval)
  }

  if (this.pmError) {
    console.error(typeof this.pmError === 'number' ? `Exit code: ${this.pmError}` : this.pmError)
  }

  const adsSummary = summary(this.getSeenAds())
  if (!this.showPmOutput && !this.runlog.enabled) { // if currently showing ads, delete the ad and print the output
    this.diffy.render(() => '')
    this.diffy.destroy()
    process.stdout.write(this.pmOutput)
  }
  if (adsSummary) console.log(adsSummary)
  this.sayGoodbye()
}

Ui.prototype.authenticate = async function authenticate ({ haveApiKey, sendAuthEmail, checkAuth }) {
  if (this.runlog.enabled) {
    prompts.override(this.config.getAuthOverrides())
  }
  if (haveApiKey) {
    const { shouldContinue } = await auth.confirm()
    if (!shouldContinue) return
  }
  const { email } = await auth.getEmail()
  if (!email) {
    this.runlog.debug('did not get an email; cannot continue authentication flow')
    auth.authenticationFailed()
    return
  }
  try {
    const res = await sendAuthEmail(email)
    if (!res.ok) {
      this.runlog.debug('got bad status code %o when requesting authentication email', res.status)
      throw new Error('Could not request auth token email')
    }
  } catch (e) {
    this.runlog.error('failed to request authentication email: %O', e)
    console.error(
      chalk.red(
        'Unable to request authentication token. Please email support@flossbank.com for support.'
      )
    )
    return
  }
  const { token } = await auth.getAuthToken()
  if (!token || !auth.isTokenTolerable(token) || !await checkAuth(email, token)) {
    this.runlog.debug('got bad token from authentication flow: %o', token)
    auth.authenticationFailed()
    return
  }
  auth.authenticationSucceeded()
  return token.trim()
}

Ui.prototype.setPmOutput = function setPmOutput (e, stdout, stderr) {
  if (stdout) {
    this.pmOutput = Buffer.concat([this.pmOutput, stdout])
  } else if (stderr) {
    this.pmOutput = Buffer.concat([this.pmOutput, stderr])
  } else if (e) {
    this.pmDone = true
    this.pmError = e
  }
}

Ui.prototype.setPmDone = function setPmDone (code) {
  if (code) {
    this.pmError = code
  }
  this.pmDone = true
}

Ui.prototype.sayGoodbye = function sayGoodbye () {
  console.log(
    chalk.white.bold('\nThanks for supporting the Open Source community with Flossbank ♥')
  )
}

Ui.prototype.showHelp = function showHelp () {
  console.log(`  Flossbank v${version}\n${USAGE}`)
}

Ui.prototype.showVersion = function showVersion () {
  console.log(version)
}

Ui.prototype.info = function info (msg) {
  console.log(chalk.white.bold(msg))
}

Ui.prototype.warn = function warn (msg) {
  console.log(chalk.yellow(msg))
}

Ui.prototype.error = function error (msg) {
  console.log(chalk.red(msg))
}

module.exports = Ui
