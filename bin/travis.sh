#!/bin/bash
set -e
npm test
STREAM_URL='https://key:secret@us-east.getstream.io/?app_id=42' ./bin/coveralls.sh 
./node_modules/.bin/eslint src/**/*.js;