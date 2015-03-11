var nconf = require('nconf');
var GetStreamNode = require('./lib/getstream-node')

function init() {

  // load config from defaults or config file

  nconf.argv().env();

  config_file = process.cwd() + '/config/getstream-node.json';

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

  return new GetStreamNode(settings);
}

module.exports.init = init;
