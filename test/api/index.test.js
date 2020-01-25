const test = require('ava')
const sinon = require('sinon')
const fetch = require('node-fetch')
const Api = require('../../src/api')
const { ROUTES, API_HOST } = require('../../src/constants')

test.before((t) => {
  sinon.stub(fetch)
})

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
  t.deepEqual(api.seen, [123])
})

test('fetchAdBatch | creates request', async (t) => {
  const api = new Api({ config: t.context.config })
  sinon.stub(api, 'createRequest').returns(['url', {}])
  api.setTopLevelPackages(['abc'])
  await api.fetchAdBatch()
  t.true(api.createRequest.calledWith(ROUTES.START, 'POST', {
    registry: 'npm',
    packages: ['abc']
  }))
})

test('completeSession | creates request', async (t) => {
  const api = new Api({ config: t.context.config })
  sinon.stub(api, 'createRequest').returns(['url', {}])
  await api.completeSession()
  t.true(api.createRequest.calledWith(ROUTES.COMPLETE, 'POST', { seen: api.seen }))
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
