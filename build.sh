#!/bin/sh

/node_modules/.bin/pkg --public -t node12 -o flossbank package.json
# zip flossbank-something.zip flossbank