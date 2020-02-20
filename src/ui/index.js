const chalk = require('chalk')
const Diffy = require('diffy')
const debug = require('debug')('flossbank')
const auth = require('./auth')
const format = require('./format')
const summary = require('./summary')
const { INTERVAL, USAGE } = require('../constants')
const { version } = require('../../package.json')

function Ui () {
  this.interval = INTERVAL
  this.pmStdout = ''
  this.pmStderr = ''
  this.pmDone = false
  this.pmError = null

  this.pmCmd = null
  this.getSeenAds = () => []
  this.doneShowingAds = async () => {}
  this.fetchAd = async () => {}

  this.runtime = 0
  this.diffy = null
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

Ui.prototype.getExecString = function getExecString () {
  const suffix = this.pmDone ? '...done!' : '.'.repeat(this.runtime % 6)
  return `Flossbank is executing ${chalk.bold(this.pmCmd)}${suffix}`
}

Ui.prototype.startAds = async function startAds () {
  if (!this.diffy && !debug.enabled) {
    this.diffy = Diffy()
    const diffy = this.diffy
    diffy.render(() => this.getExecString())
    this.renderInterval = setInterval(() => {
      this.runtime++
      diffy.render()
    }, 1000)
  }
  if (!this.pmDone) {
    let ad
    try {
      ad = await this.fetchAd()
    } catch (e) {
      debug('failed to fetch ad: %O', e)
      return this.failure()
    }
    if (!ad) return this.failure()

    const formattedAd = format(ad)
    if (!debug.enabled) {
      this.diffy.render(() => `${this.getExecString()}\n${formattedAd}`)
    } else {
      debug('showing ad: %O', ad)
    }
    setTimeout(() => this.startAds(), this.interval)
  } else {
    this.doneShowingAds()
    this.showCompletion()
  }
}

Ui.prototype.failure = async function failure () {
  if (!this.pmDone) {
    debug('package manager is not done yet; waiting to show completion message')
    setTimeout(() => this.failure(), 500)
    return
  }
  this.showCompletion()
}

Ui.prototype.showCompletion = async function showCompletion () {
  debug('package manager complete; printing output')
  if (!debug.enabled) {
    // clear ad and close diffy
    clearInterval(this.renderInterval)
    this.diffy.render(() => '')
    this.diffy.destroy()
  }

  const adsSummary = summary(this.getSeenAds())

  if (this.pmStdout) console.log(this.pmStdout)
  if (this.pmStderr) console.error(this.pmStderr)
  if (adsSummary) console.log(adsSummary)
}

Ui.prototype.authenticate = async function authenticate ({ haveApiKey, sendAuthEmail }) {
  if (haveApiKey) {
    const { shouldContinue } = await auth.confirm()
    if (!shouldContinue) return
  }
  const { email } = await auth.getEmail()
  if (!email) {
    debug('did not get an email; cannot continue authentication flow')
    auth.authenticationFailed()
    return
  }
  try {
    const res = await sendAuthEmail(email)
    if (!res.ok) {
      debug('got bad status code %o when requesting authentication email', res.statusCode)
      throw new Error('Could not request auth token email')
    }
  } catch (e) {
    debug('failed to request authentication email: %O', e)
    console.error(
      chalk.red(
        'Unable to request authentication token. Please email support@flossbank.com for support.'
      )
    )
    return
  }
  const { token } = await auth.getAuthToken()
  if (!token || !auth.isTokenTolerable(token)) {
    debug('got bad token from authentication flow: %o', token)
    auth.authenticationFailed()
    return
  }
  auth.authenticationSucceeded()
  return token.trim()
}

Ui.prototype.setPmOutput = function setPmOutput (e, stdout, stderr) {
  this.pmStdout = stdout
  this.pmStderr = stderr
  this.pmError = e
  this.pmDone = true
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
