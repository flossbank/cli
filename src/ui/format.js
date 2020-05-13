const boxen = require('boxen')
const color = require('kleur')
const wrap = require('./wrap')

const colors = ['yellow', 'green', 'magenta', 'cyan', 'red']
let colorIdx = Math.floor(Math.random() * colors.length)

function getNextColor () {
  return colors[colorIdx++ % colors.length]
}

function formatTitle (title) {
  return color.white().bold(wrap(title))
}

function formatText (text) {
  return color.white(
    wrap(
      text.replace(
        /{{([^}]*?)}}/g,
        (_, url) => color.blue().underline(url)
      )
    )
  )
}

function formatUrl (url) {
  return color.blue().underline(wrap(url, { cut: true }))
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
