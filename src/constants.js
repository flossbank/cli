module.exports = {
  INTERVAL: 5000,
  TIMEOUT: 10000,
  API_HOST: 'https://api.flossbank.com',
  ROUTES: {
    START: 'session/start',
    COMPLETE: 'session/complete',
    SEND_AUTH: 'user/register'
  },
  SUPPORTED_ARGS: ['help', 'version', 'auth', 'install', 'uninstall', 'source'],
  DEFAULT_CONFIG: {},
  PROJECT_NAME: 'flossbank',
  CONFIG_API_KEY: 'apiKey',
  SHEBANG: '#!/usr/bin/env bash',
  ALIAS_FILE: 'flossbank_aliases.sh',
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
