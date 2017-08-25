#!/bin/bash
set -e
npm test
./bin/coveralls.sh
# ./node_modules/.bin/eslint src/**/*.js;
