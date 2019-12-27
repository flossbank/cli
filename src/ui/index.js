const chalk = require('chalk')
const prompts = require('prompts')
const diffy = require('diffy')()
const auth = require('./auth')
const format = require('./format')

function Ui (api, adInterval, pmCmd, doneShowingAds) {
  this.pmCmd = pmCmd
  this.api = api
  this.interval = adInterval
  this.pmStdout = ''
  this.pmStderr = ''
  this.pmDone = false
  this.pmError = null
  this.doneShowingAds = doneShowingAds

  this.runtime = 0
  this.init = false
}

Ui.prototype.getExecString = function getExecString () {
  const suffix = this.pmDone ? '...done!' : '.'.repeat(this.runtime % 6)
  return `Executing ${chalk.bold(this.pmCmd)}${suffix}`
}

Ui.prototype.startAds = async function startAds () {
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
      ad = await this.api.fetchAd()
    } catch (_) {
      return this.failure()
    }
    if (!ad) return this.failure()

    const formattedAd = format(ad)
    diffy.render(() => `${this.getExecString()}\n${formattedAd}`)
    setTimeout(() => this.startAds(), this.interval)
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

Ui.prototype.auth = async function () {
  const { email } = await auth.getEmail()
  try {
    const res = await this.api.sendAuthEmail(email)
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
  return token
}

Ui.prototype.setPmOutput = function (e, stdout, stderr) {
  this.pmStdout = stdout
  this.pmStderr = stderr
  this.pmError = e
  this.pmDone = true
}

module.exports = Ui
