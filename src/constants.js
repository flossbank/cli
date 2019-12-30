module.exports = {
  INTERVAL: 5000,
  API_HOST: 'https://api.flossbank.com',
  ROUTES: {
    GET_AD: 'ad/get',
    COMPLETE: 'session/complete',
    SEND_AUTH: 'auth/send'
  },
  DEFAULT_CONFIG: {},
  CONFIG_DIR: '.flossbank',
  CONFIG_FILENAME: 'config',
  SUPPORTED_PMS: ['npm', 'yarn'],
  USAGE: `
  Usage:
    flossbank [option]
    flossbank <package manager command>

  Options:
    --auth  Authenticates with Flossbank API
    --help  Shows this help output

  Examples:
    To run \`npm install\` through Flossbank:
      $ flossbank npm install
    To run \`yarn add meow\` through Flossbank:
      $ flossbank yarn add meow
    To authenticate (or re-authenticate) with the Flossbank API:
      $ flossbank --auth
`
}
