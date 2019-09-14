const boxen = require('boxen')
const chalk = require('chalk')
const wrap = require('./wrap')
const { isCI } = require('./detect')

const colors = ['yellow', 'green', 'magenta', 'cyan', 'red']
let colorIdx = Math.floor(Math.random() * colors.length)

function getNextColor () {
  return colors[colorIdx++ % colors.length]
}

function formatTitle (title) {
  title = wrap(title)

  if (!isCI()) {
    title = chalk.white(title)
  }

  title = chalk.bold(title)

  return title
}

function formatText (text) {
  text = wrap(text)

  text = text.replace(
    /{{([^}]*?)}}/g,
    (match, url) => chalk.blue.underline(url)
  )

  if (!isCI()) {
    text = chalk.white(text)
  }

  return text
}

function formatUrl (url) {
  url = wrap(url, { cut: true })
  return chalk.blue.underline(url)
}

module.exports = function formatMessage (message) {
  const { title, body, url } = message

  const coloredMessage = formatTitle(title) + '\n' + formatText(body) +
    '\n' + formatUrl(url)

  const opts = {
    borderColor: getNextColor(),
    align: 'center',
    float: 'center',
    margin: 0,
    padding: {
      top: 1,
      right: 2,
      bottom: 1,
      left: 2
    }
  }

  return boxen(coloredMessage, opts)
}
