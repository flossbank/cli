const boxen = require('boxen')
const chalk = require('chalk')
const wrap = require('./lib/wrap')
const {
  isHyper,
  isITerm,
  isCI,
  isSilentMode
} = require('./lib/detect')

function formatTitle (title) {
  title = wrap(title)

  if (!isCI()) {
    title = chalk.black(title)
  }

  if (!isHyper() && !isITerm()) {
    title = chalk.bold(title)
  }

  return title
}

function formatText (text) {
  text = wrap(text)

  text = text.replace(
    /{{([^}]*?)}}/g,
    (match, url) => chalk.blue.underline(url)
  )

  if (!isCI()) {
    text = chalk.black(text)
  }

  return text
}

function formatUrl (url) {
  url = wrap(url, { cut: true })
  return chalk.blue.underline(url)
}

function formatMessage (message) {
  const { title, body, url } = message

  const coloredMessage = formatTitle(title) + '\n\n' + formatText(body) +
    '\n\n' + formatUrl(url)

  const opts = {
    align: 'center',
    borderStyle: {
      topLeft: ' ',
      topRight: ' ',
      bottomLeft: ' ',
      bottomRight: ' ',
      horizontal: ' ',
      vertical: ' '
    },
    float: 'center',
    margin: 0,
    padding: {
      top: 1,
      right: 4,
      bottom: 1,
      left: 4
    }
  }

  if (!isCI()) {
    Object.assign(opts, {
      backgroundColor: 'white'
    })
  }

  return boxen(coloredMessage, opts)
}

function getRandomDefaultAd () {
  return defaultAds[Math.floor(Math.random() * defaultAds.length)]
}

module.exports = function showAd (interval = 3000) {
  // Do not print message when npm is run in silent mode
  if (isSilentMode()) return

  const ad = getRandomDefaultAd()

  // Format the message and print it
  const formattedAd = formatMessage(ad)
  console.log(formattedAd + '\n')

  setTimeout(showAd, interval)
}
