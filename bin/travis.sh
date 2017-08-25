#!/bin/bash
set -e
npm test
./bin/coveralls.sh
