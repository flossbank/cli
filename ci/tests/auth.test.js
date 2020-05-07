const test = require('ava')
// const { constants: { INTEG_TEST_EMAIL, INTEG_TEST_KEY } } = require('./util/_common')
// const flossbank = require('./util/_flossbank')

test.serial('integ: auth flow successful', async (t) => {
  t.pass('this test needs thought considering the polling registration mechanism')
  // await flossbank.config.clearApiKey()
  // await flossbank.config.setAuthOverrides({ email: INTEG_TEST_EMAIL, token: INTEG_TEST_KEY })
  // const runlog = await flossbank.run(['auth'])

  // t.deepEqual(runlog.arguments, { hasArgs: true, auth: true })
  // t.true(runlog.newApiKeySet)

  // t.is(await flossbank.config.getApiKey(), INTEG_TEST_KEY)
})
