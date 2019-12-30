const prompts = require('prompts')

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
    message: 'Flossbank: please enter your email address to send your authentication token:'
  })
}

exports.getAuthToken = async function getAuthToken () {
  return prompts({
    type: 'password',
    name: 'token',
    message: 'Please enter the token from the link that was emailed to you:'
  })
}