const boxen = require('boxen')
const chalk = require('chalk')
const termSize = require('term-size')
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

function analyze (msg) {
  let lines = 0
  let currentWidth = 0
  let maxWidth = 0
  for (const ltr of msg) {
    if (ltr === '\n') {
      // end of current line
      if (currentWidth > maxWidth) maxWidth = currentWidth
      currentWidth = 0
      lines++
    }
    currentWidth++
  }
  return [lines, maxWidth]
}

module.exports = function formatMessage (message) {
  const { title, body, url } = message

  const coloredMessage = formatTitle(title) + '\n\n' + formatText(body) +
  '\n\n' + formatUrl(url)

  const height = termSize().rows
  const width = termSize().columns
  const [lines, maxWidth] = analyze(coloredMessage)

  const top = Math.floor(height / 2) - Math.ceil(lines / 2) - 2
  const bottom = Math.floor(height / 2) - Math.ceil(lines / 2) - 4

  const pad = Math.floor((width - maxWidth) / 2)

  const opts = {
    borderColor: getNextColor(),
    align: 'center',
    float: 'center',
    margin: {
      top: top,
      right: 0,
      bottom: bottom,
      left: 0
    },
    padding: {
      top: 2,
      right: pad,
      bottom: 2,
      left: pad
    }
  }

  return boxen(coloredMessage, opts)
}
