# Stream Node

## Getting started

3. Install getstream-node via `npm install stream-node` for your application.
4. Copy `getstream.js` from `node_modules/stream-node` into the root directory of
   your application.
5. Edit `getstream.js` and set your data from your getstream.io account.
6. `require('stream-node');` on your application.

If you wish to keep the configuration for the module separate from your
application, the module will look for getstream.js in the directory referenced
by the environment variable `STREAM_NODE_CONFIG_DIR` if it's set.