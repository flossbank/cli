const test = require('ava')
const sinon = require('sinon')
const nock = require('nock')
const Api = require('../../src/api')
const { ROUTES, API_HOST } = require('../../src/constants')

test.beforeEach((t) => {
  t.context.config = {
    getApiKey: sinon.stub().returns('abc')
  }
})

test('getApiKey | gets api key from config', async (t) => {
  const api = new Api({ config: t.context.config })
  api.getApiKey()
  t.true(t.context.config.getApiKey.calledOnce)
})

test('fetchAd | empty unseen', async (t) => {
  const api = new Api({ config: t.context.config })
  sinon.stub(api, 'fetchAdBatch')
  await t.throwsAsync(api.fetchAd())
  t.true(api.fetchAdBatch.calledOnce)
})

test('fetchAd | gets an ad', async (t) => {
  const api = new Api({ config: t.context.config })
  api.unseen = [{ id: 123 }]
  const ad = await api.fetchAd()
  t.deepEqual(ad.id, 123)
  t.deepEqual(api.seen, [{ id: 123 }])
})

test('fetchAdBatch | creates request', async (t) => {
  const scope = nock('https://api.flossbank.com')
    .post('/session/start')
    .reply(200, JSON.stringify({
      ads: [],
      sessionId: 'abc'
    }))
  const api = new Api({ config: t.context.config })
  sinon.spy(api, 'createRequest')
  await api.fetchAdBatch()
  t.true(api.createRequest.calledWith(ROUTES.START, 'POST', {}))
  scope.done()
})

test('completeSession | creates request', async (t) => {
  const scope = nock('https://api.flossbank.com')
    .post('/session/complete')
    .reply(200)
  const api = new Api({ config: t.context.config })
  sinon.spy(api, 'createRequest')
  await api.completeSession({
    registry: 'npm',
    language: 'javascript',
    packages: ['abc'],
    metadata: { packageManagerVersion: 'npm@1.1.1' }
  })
  t.true(api.createRequest.calledWith(ROUTES.COMPLETE, 'POST', {
    registry: 'npm',
    language: 'javascript',
    packages: ['abc'],
    metadata: { packageManagerVersion: 'npm@1.1.1' },
    seen: api.seen.map(ad => ad.id)
  }))
  scope.done()
})

test('createRequest | no key throws', async (t) => {
  const api = new Api({ config: t.context.config })
  t.context.config.getApiKey.returns(null)
  t.throws(() => api.createRequest())
})

test('createRequest | creates request', async (t) => {
  const api = new Api({ config: t.context.config })
  api.key = 'abc'
  const [url, options] = api.createRequest('endpoint', 'POST', { a: 1 })
  t.deepEqual(url, `${API_HOST}/endpoint`)
  t.deepEqual(options.headers.authorization, 'Bearer abc')
  t.deepEqual(options.headers['content-type'], 'application/json')
  t.deepEqual(options.method, 'POST')
  t.deepEqual(options.body, '{"a":1}')
})

test('long request times out', async (t) => {
  const scope = nock('https://api.flossbank.com')
    .post('/session/complete')
    .delay(11000)
    .reply(200)
  const api = new Api({ config: t.context.config })
  sinon.spy(api, 'createRequest')
  await t.throwsAsync(api.completeSession())
  t.true(api.createRequest.calledWith(ROUTES.COMPLETE, 'POST', {
    seen: api.seen.map(ad => ad.id)
  }))
  scope.done()
})
