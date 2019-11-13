module.exports = {
  INTERVAL: 4000,
  API_HOST: 'https://flossbank-api.now.sh', // TODO replace this with the prod host
  API_HOST_TEST: 'http://localhost:3000', // TODO replace this with the prod host
  ROUTES: {
    GET_AD: 'api/ad/get',
    COMPLETE: 'api/session/complete',
    SEND_AUTH: 'api/auth/send'
  },
  DEFAULT_CONFIG: {},
  CONFIG_DIR: '.flossbank',
  CONFIG_FILENAME: 'config',
  SUPPORTED_PMS: ['npm', 'yarn'],
  SUPPORTED_VERBS: ['install', 'add', 'i']
}
