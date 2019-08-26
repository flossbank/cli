#!/usr/bin/env node
const React = require('react')
const importJsx = require('import-jsx')
const { render } = require('ink')

const main = importJsx('./main')

render(React.createElement(main, { args: [...process.argv].slice(2) }))
