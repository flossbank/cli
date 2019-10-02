const prompts = require('prompts')

exports.getEmail = async function getEmail () {
  return prompts({
    type: 'text',
    name: 'email',
    message: 'Please enter your email address to send your authentication token:'
  })
}

exports.getAuthToken = async function getAuthToken () {
  return prompts({
    type: 'password',
    name: 'token',
    message: 'Please enter the token from the link that was emailed to you:'
  })
}
