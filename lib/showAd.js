const boxen = require('boxen')
const chalk = require('chalk')

const {
  isHyper,
  isITerm,
  isCI,
  isSilentMode
} = require('./detect')

const { isShownRecently, markShown } = require('./analytics')

const { checkMessage } = require('./check')
const messages = []
const wrap = require('./wrap')

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
  const { title, text, url } = message

  const coloredMessage = formatTitle(title) + '\n\n' + formatText(text) +
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

function showAd () {
  // Do not print message when npm is run in silent mode
  if (isSilentMode()) return

  // Do not print message when one has been shown recently
  if (isShownRecently()) return

  // TODO: If no messages, fetch a message
  if (messages.length === 0) {

  }

  // TODO: delete
  messages[0] = {title: 'Hello', text: 'Sign up for indeed.com', url: 'www.indeed.com'}

  // Select a random message
  const i = Math.floor(Math.random() * messages.length)
  const message = messages[i]

  // Check if the strings are safe to print to the terminal. Specifically, the
  // string should be plain ASCII, excluding control characters. This is
  // paranoid and not strictly necessary since (1) we curate the messages.json
  // file by hand and will never include non-ASCII text, and (2) we check the
  // strings at package publish time (see test/messages.js). But it doesn't hurt
  // to check again in the client and assert that messages are plain ASCII. This
  // is the security principle of defense-in-depth.
  checkMessage(message)

  // Format the message and print it
  const formattedMessage = formatMessage(message)
  console.log(formattedMessage + '\n')

  // Limit the frequency that messages are shown
  markShown()
}

module.exports = {
  showAd
}