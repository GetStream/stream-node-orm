var nconf = require('nconf');

var Config = function () {
  // load config from defaults or config file

  nconf.argv().env();

  if (typeof(process) != "undefined" && process.env.STREAM_NODE_CONFIG_DIR) {
    config_file = process.env.STREAM_NODE_CONFIG_DIR + '/getstream.json';
  } else {
    config_file = process.cwd() + '/getstream.json';
  }

  nconf.file({ file: config_file });

  nconf.defaults({
    "getstream-node": {
      "apiKey": "",
      "apiSecret": "",
      "apiAppId": "",
      "apiLocation": "",
      "userFeed": "user",
      "notificationFeed": "user",
      "newsFeeds": {
        "flat": "flat",
        "aggregated": "aggregated"
      }
    }
  });

  settings = nconf.get('getstream-node');

  return settings;
};

module.exports = Config;