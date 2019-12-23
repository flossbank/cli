module.exports = {
  INTERVAL: 4000,
  API_HOST: '0.0.0.0',
  API_HOST_TEST: 'https://api.flossbank.io',
  ROUTES: {
    GET_AD: 'ad/get',
    COMPLETE: 'session/complete',
    SEND_AUTH: 'auth/send'
  },
  DEFAULT_CONFIG: {},
  CONFIG_DIR: '.flossbank',
  CONFIG_FILENAME: 'config',
  SUPPORTED_PMS: ['npm', 'yarn']
}
