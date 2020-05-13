const prompts = require('prompts')

exports.confirm = async function confirm () {
  return prompts({
    type: 'confirm',
    name: 'shouldContinue',
    message: '',
    initial: false,
    onRender (color) { this.msg = color.reset().white('This installation of Flossbank is already registered to an email address. Override?') }
  })
}

exports.getEmail = async function getEmail () {
  return prompts({
    type: 'text',
    name: 'email',
    message: '',
    onRender (color) { this.msg = color.reset().white('Please enter your email address so that we can send your verification email:') }
  })
}
