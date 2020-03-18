module.exports = {
  INTERVAL: 5000,
  TIMEOUT: 10000,
  API_HOST: 'https://api.flossbank.com',
  ROUTES: {
    START: 'session/start',
    COMPLETE: 'session/complete',
    SEND_AUTH: 'user/register'
  },
  SUPPORTED_ARGS: ['help', 'version', 'auth', 'install', 'uninstall', 'runlog'],
  SOURCE_VARIANT_SHELL: 'shell',
  SOURCE_VARIANT_POWER: 'power',
  DEFAULT_ALIASES: { shell: {}, power: {} },
  DEFAULT_CONFIG: {},
  PROJECT_NAME: 'flossbank',
  CONFIG_API_KEY: 'apiKey',
  CONFIG_ALIASES: 'aliases',
  CONFIG_LAST_RUNLOG: 'lastRunlog',
  SHEBANG: '#!/usr/bin/env bash',
  SUPPORTED_PMS: ['npm', 'yarn', 'pip'],
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
