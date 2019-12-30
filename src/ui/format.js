const boxen = require('boxen')
const chalk = require('chalk')
const wrap = require('./wrap')

const colors = ['yellow', 'green', 'magenta', 'cyan', 'red']
let colorIdx = Math.floor(Math.random() * colors.length)

function getNextColor () {
  return colors[colorIdx++ % colors.length]
}

function formatTitle (title) {
  return chalk.white.bold(wrap(title))
}

function formatText (text) {
  return chalk.white(
    wrap(
      text.replace(
        /{{([^}]*?)}}/g,
        (_, url) => chalk.blue.underline(url)
      )
    )
  )
}

function formatUrl (url) {
  return chalk.blue.underline(wrap(url, { cut: true }))
}

module.exports = function formatMessage (message) {
  const { title, body, url } = message

  const coloredMessage = formatTitle(title) + '\n\n' + formatText(body) +
  '\n\n' + formatUrl(url)

  return boxen(coloredMessage, {
    borderColor: getNextColor(),
    align: 'center',
    float: 'center',
    padding: 2,
    margin: 2
  })
}
