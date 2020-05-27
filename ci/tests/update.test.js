const test = require('ava')
const { sleep } = require('./util/_common')
const flossbank = require('./util/_flossbank')

test.serial('integ: update flow successful', async (t) => {
  await flossbank.run([])
  await sleep(1000) // let the deferred update check run
  const config = flossbank.config.get()
  t.true(config.getLastUpdateCheck() > 0)
})
