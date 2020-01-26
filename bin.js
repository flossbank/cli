#!/usr/bin/env node
require('./dist/flossbank.bundle')()

try {
  require('update-notifier')({ pkg: require('./package.json') }).notify()
} catch (_) {}
