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

exports.authenticationFailed = function authenticationFailed() {
  console.log(`${chalk.red('✖')} ${chalk.white.bold('Authentication failed: please enter the valid api key granted through the link in your email')}`)
}

exports.authenticationSucceeded = function authenticationSucceeded() {
  console.log(`${chalk.green('✔')} ${chalk.white.bold('Authentication successful')}`)
}
