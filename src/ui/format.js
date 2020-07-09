const boxen = require('boxen')
const color = require('kleur')
const wordWrap = require('word-wrap')
const termSize = require('term-size')

const MAX_WIDTH = 100
const PADDING_COLS = 26 // padding is 2*3 on each side; margin is 2*3 on each side; +2 chars for boxen lines = 26

function getMaxTextWidth () {
  return Math.min(MAX_WIDTH, termSize().columns) - PADDING_COLS
}

/**
 * Wrap text so it fits within the terminal window width while respecting word
 * boundaries.
 */
function wrap (str) {
  const opts = {
    width: getMaxTextWidth(),
    indent: ''
  }
  return wordWrap(str, opts)
}

const colors = ['yellow', 'green', 'magenta', 'cyan', 'red']
let colorIdx = Math.floor(Math.random() * colors.length)

function getNextColor () {
  return colors[colorIdx++ % colors.length]
}

function formatTitle (title) {
  const wrappedTitle = wrap(title)
  const formattedTitle = wrappedTitle.split('\n').map(line => color.white().bold(line)).join('\n')
  return formattedTitle
}

function formatText (text) {
  const wrappedText = wrap(text)
  const formattedText = wrappedText.split('\n').map(line => color.white(line)).join('\n')
  return formattedText
}

function formatUrl (url) {
  if (url.length > getMaxTextWidth()) return ''
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
