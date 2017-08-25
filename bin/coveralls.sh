#!/bin/bash
set -e
istanbul cover ./bin/run-tests.js --report lcov
cat ./coverage/lcov.info | ./node_modules/.bin/coveralls
rm -rf ./coverage
