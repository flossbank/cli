const prompts = require('prompts')
const chalk = require('chalk')

exports.confirm = async function confirm () {
  return prompts({
    type: 'confirm',
    name: 'shouldContinue',
    message: 'A Flossbank API key is already configured. Override?',
    initial: false
  })
}

exports.getEmail = async function getEmail () {
  return prompts({
    type: 'text',
    name: 'email',
    message: 'Flossbank: please enter your email address to send your API key:'
  })
}

exports.getAuthToken = async function getAuthToken () {
  return prompts({
    type: 'password',
    name: 'token',
    message: 'Please click the link in your email and enter the API key here:'
  })
}

exports.authenticationFailed = function authenticationFailed () {
  console.log(`${chalk.red('✖')} ${chalk.white.bold('Authentication failed: invalid token. Please try again or email support@flossbank.com for help.')}`)
}

exports.authenticationSucceeded = function authenticationSucceeded () {
  console.log(`${chalk.green('✔')} ${chalk.white.bold('Authentication successful')}`)
}

exports.isTokenTolerable = function isTokenTolerable (token) {
  return typeof token === 'string' && /^[a-f0-9]+$/.test(token.trim())
}
