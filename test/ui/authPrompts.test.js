const test = require('ava')
const sinon = require('sinon')
const prompts = require('prompts')
const auth = require('../../src/ui/authPrompts')

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
})
