const chalk = require('chalk')
const prompts = require('prompts')
const diffy = require('diffy')()
const auth = require('./auth')
const format = require('./format')
const { INTERVAL, USAGE } = require('../constants')

function Ui () {
  this.interval = INTERVAL
  this.pmStdout = ''
  this.pmStderr = ''
  this.pmDone = false
  this.pmError = null

  this.pmCmd = null
  this.doneShowingAds = () => {}

  this.runtime = 0
  this.init = false
}

Ui.prototype.setPmCmd = function setPmCmd (pmCmd) {
  this.pmCmd = pmCmd
  return this
}

Ui.prototype.setCallback = function setCallback (cb) {
  this.doneShowingAds = cb
  return this
}

Ui.prototype.getExecString = function getExecString () {
  const suffix = this.pmDone ? '...done!' : '.'.repeat(this.runtime % 6)
  return `Executing ${chalk.bold(this.pmCmd)}${suffix}`
}

Ui.prototype.startAds = async function startAds ({ fetchAd }) {
  if (!this.init) {
    this.init = true
    diffy.render(() => this.getExecString())
    this.renderInterval = setInterval(() => {
      this.runtime++
      diffy.render()
    }, 1000)
  }
  if (!this.pmDone) {
    let ad
    try {
      ad = await fetchAd()
    } catch (_) {
      return this.failure()
    }
    if (!ad) return this.failure()

    const formattedAd = format(ad)
    diffy.render(() => `${this.getExecString()}\n${formattedAd}`)
    setTimeout(() => this.startAds({ fetchAd }), this.interval)
  } else {
    this.doneShowingAds()
    this.showCompletion()
  }
}

Ui.prototype.failure = async function failure () {
  if (!this.pmDone) {
    setTimeout(() => this.failure(), 500)
    return
  }
  this.showCompletion()
}

Ui.prototype.showCompletion = async function showCompletion () {
  // clear ad and close diffy
  clearInterval(this.renderInterval)
  const status = this.pmError ? 'failed' : 'completed successfully'
  const { shouldShowOutput } = await prompts({
    type: 'confirm',
    name: 'shouldShowOutput',
    message: `${this.pmCmd.split(' ').shift()} install ${status}. View output?`,
    initial: !!this.pmError
  })
  diffy.render(() => '')
  diffy.destroy()

  if (shouldShowOutput) {
    if (this.pmStdout) console.log(this.pmStdout)
    if (this.pmStderr) console.error(this.pmStderr)
  }
}

Ui.prototype.authenticate = async function authenticate ({ haveApiKey, sendAuthEmail }) {
  if (haveApiKey) {
    const { shouldContinue } = await auth.confirm()
    if (!shouldContinue) return
  }
  const { email } = await auth.getEmail()
  if (!email) return
  try {
    const res = await sendAuthEmail(email)
    if (!res.ok) throw new Error(`Could not request auth token email`)
  } catch (e) {
    console.error(
      chalk.red(
        'Unable to request authentication token. Please email support@flossbank.com for support.'
      )
    )
    return
  }
  const { token } = await auth.getAuthToken()
  console.log('Authentication succesful')
  return token
}

Ui.prototype.setPmOutput = function setPmOutput (e, stdout, stderr) {
  this.pmStdout = stdout
  this.pmStderr = stderr
  this.pmError = e
  this.pmDone = true
}

Ui.prototype.showHelp = function showHelp () {
  console.log(USAGE)
}

Ui.prototype.info = function info (msg) {
  console.log(msg)
}

Ui.prototype.warn = function warn (msg) {
  console.log(chalk.yellow(msg))
}

Ui.prototype.error = function error (msg) {
  console.log(chalk.red(msg))
}

module.exports = Ui
