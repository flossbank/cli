const test = require('ava')
const { constants: { INTEG_TEST_KEY, INTEG_TEST_TOKEN } } = require('./util/_common')
const flossbank = require('./util/_flossbank')

test.serial('integ: auth flow successful', async (t) => {
  await flossbank.config.clearApiKey()
  const runlog = await flossbank.run(['auth', INTEG_TEST_TOKEN])

  t.true(runlog.newApiKeySet)
  t.is(await flossbank.config.getApiKey(), INTEG_TEST_KEY)
})
