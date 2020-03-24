const test = require('ava')
const sinon = require('sinon')
const nock = require('nock')
const Api = require('../../src/api')
const { ROUTES } = require('../../src/constants')

test.beforeEach((t) => {
  t.context.config = {
    getApiKey: sinon.stub().returns('abc'),
    getApiHost: sinon.stub().returns('https://api.flossbank.com')
  }
  t.context.runlog = {
    debug: sinon.stub(),
    record: sinon.stub(),
    error: sinon.stub(),
    keys: {}
  }
})

test('getApiKey | gets api key from config', async (t) => {
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  api.getApiKey()
  t.true(t.context.config.getApiKey.calledOnce)
})

test('fetchAd | empty unseen', async (t) => {
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  sinon.stub(api, 'fetchAdBatch')
  await t.throwsAsync(api.fetchAd())
  t.true(api.fetchAdBatch.calledOnce)
})

test('fetchAd | gets an ad', async (t) => {
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
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
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  sinon.spy(api, 'createRequest')
  await api.fetchAdBatch()
  t.true(api.createRequest.calledWith(ROUTES.START, 'POST', {}))
  scope.done()
})

test('checkAuth | creates request', async (t) => {
  const scope = nock('https://api.flossbank.com')
    .post('/user/check')
    .reply(200)
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  sinon.spy(api, 'createRequest')
  const res = await api.checkAuth('email', 'apiKey')
  t.true(api.createRequest.calledWith(ROUTES.CHECK_AUTH, 'POST', { email: 'email', apiKey: 'apiKey' }))
  t.true(res)
  scope.done()
})

test('checkAuth | considers 429 as failure', async (t) => {
  const scope = nock('https://api.flossbank.com')
    .post('/user/check')
    .reply(429)
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  sinon.spy(api, 'createRequest')
  t.false(await api.checkAuth('email', 'apiKey'))
  scope.done()
})

test('checkAuth | considers 401 as failure', async (t) => {
  const scope = nock('https://api.flossbank.com')
    .post('/user/check')
    .reply(401)
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  sinon.spy(api, 'createRequest')
  t.false(await api.checkAuth('email', 'apiKey'))
  scope.done()
})

test('checkAuth | fetch failure means no', async (t) => {
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  api.createRequest = sinon.stub().returns(['some bad url that causes fetch to throw', {}])
  t.false(await api.checkAuth('email', 'apiKey'))
})

test('completeSession | creates request', async (t) => {
  const scope = nock('https://api.flossbank.com')
    .post('/session/complete')
    .reply(200)
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  sinon.spy(api, 'createRequest')
  await api.completeSession([['abc'], 'npm', 'javascript', 'npm@1.1.1', '0.0.18'])
  t.deepEqual(api.createRequest.lastCall.args, [
    ROUTES.COMPLETE,
    'POST',
    {
      registry: 'npm',
      language: 'javascript',
      packages: ['abc'],
      metadata: { packageManagerVersion: 'npm@1.1.1', flossbankVersion: '0.0.18' },
      seen: api.seen.map(ad => ad.id)
    }
  ])
  scope.done()
})

test('createRequest | no key throws', async (t) => {
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  t.context.config.getApiKey.returns(null)
  t.throws(() => api.createRequest())
})

test('createRequest | creates request', async (t) => {
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  api.key = 'abc'
  const [url, options] = api.createRequest('endpoint', 'POST', { a: 1 })
  t.deepEqual(url, `${t.context.config.getApiHost()}/endpoint`)
  t.deepEqual(options.headers.authorization, 'Bearer abc')
  t.deepEqual(options.headers['content-type'], 'application/json')
  t.deepEqual(options.method, 'POST')
  t.deepEqual(options.body, '{"a":1}')
})

test('long request times out', async (t) => {
  const scope = nock('https://api.flossbank.com')
    .post('/user/register')
    .delay(11000)
    .reply(200)
  const api = new Api({ config: t.context.config, runlog: t.context.runlog })
  sinon.spy(api, 'createRequest')
  await t.throwsAsync(api.sendAuthEmail())
  scope.done()
})
