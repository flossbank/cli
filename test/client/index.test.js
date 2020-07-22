
const test = require('ava')
const sinon = require('sinon')
const Client = require('../../src/client')

test.beforeEach((t) => {
  const config = {
    getApiHost: () => 'http://localhost',
    getApiKey: () => 'api_key'
  }
  const runlog = {
    error: sinon.stub(),
    debug: sinon.stub(),
    record: sinon.stub(),
    keys: {}
  }
  const client = new Client({ config, runlog })
  client.got = {
    post: sinon.stub()
  }
  t.context.client = client
})

test('reuses session id on subsequent ad batch calls', async (t) => {
  const { client } = t.context
  client.got.post.returns({
    sessionId: 'first_session_id',
    ads: [{ title: 'first' }]
  })

  const ad = await client.getAd()
  t.is(ad.title, 'first')
  t.is(client.seen.length, 1)
  t.is(client.unseen.length, 0)

  // re-calling with no ads left in unseen
  await client.getAd()

  // assert that the last call made to start session included the previous session id
  t.deepEqual(client.got.post.lastCall.args, [client.routes.SESSION_START, {
    json: { sessionId: 'first_session_id' }
  }])
})
