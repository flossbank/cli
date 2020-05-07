const prompts = require('prompts')

exports.confirm = async function confirm () {
  return prompts({
    type: 'confirm',
    name: 'shouldContinue',
    message: 'This installation of Flossbank is already registered to an email address. Override?',
    initial: false
  })
}

exports.getEmail = async function getEmail () {
  return prompts({
    type: 'text',
    name: 'email',
    message: 'Please enter your email address so that we can send your verification email:'
  })
}
