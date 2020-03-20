const test = require('ava')
const sinon = require('sinon')
const chalk = require('chalk')
const prompts = require('prompts')
const auth = require('../../src/ui/auth')

test.before(() => {
  sinon.stub(console, 'log')
})

test.after.always(() => {
  console.log.restore()
})

test('prompts', async (t) => {
  prompts.inject([
    true, // confirm yes
    false, // confirm no
    'papa@papajohns.com', // get email
    'token' // getAuthToken
  ])
  let { shouldContinue } = await auth.confirm()
  t.is(shouldContinue, true);
  ({ shouldContinue } = await auth.confirm())
  t.is(shouldContinue, false)

  const { email } = await auth.getEmail()
  t.is(email, 'papa@papajohns.com')

  const { token } = await auth.getAuthToken()
  t.is(token, 'token')
})

test('authenticationFailed', (t) => {
  auth.authenticationFailed()
  t.true(console.log.calledWith(
    `${chalk.red('✖')} ${chalk.white.bold('Authentication failed: invalid token. Please try again or email support@flossbank.com for help.')}`
  ))
})

test('authenticationSucceeded', (t) => {
  auth.authenticationSucceeded()
  t.true(console.log.calledWith(
    `${chalk.green('✔')} ${chalk.white.bold('Authentication successful')}`
  ))
})

test('isTokenTolerable | valid and invalid', (t) => {
  t.true(auth.isTokenTolerable('deadbeef'))
  t.true(auth.isTokenTolerable('abcd'))
  t.false(auth.isTokenTolerable())
  t.false(auth.isTokenTolerable(125))
  t.false(auth.isTokenTolerable({}))
  t.false(auth.isTokenTolerable([]))
  t.false(auth.isTokenTolerable('ab cd'))
  t.false(auth.isTokenTolerable('asdf'))
})
