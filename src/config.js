var path = require('path'),
    fs = require('fs'),
    exists = fs.existsSync || path.existsSync;

function _loadFile(path) {

  var settings = {};

  config = JSON.parse(JSON.stringify(require(path).config));

  Object.keys(config).forEach(function (key) {
    settings[key] = config[key]
  });

  return settings;
}

var Config = function () {
  var settings = {},
      config_file = '';
  // load config from defaults or config file

  if (typeof(process) != "undefined" && process.env.STREAM_NODE_CONFIG_DIR) {
    config_file = process.env.STREAM_NODE_CONFIG_DIR + '/getstream.js';
  } else {
    config_file = process.cwd() + '/getstream.js';
  }

  var default_config_file = path.join(__dirname, 'config.default.js');

  if (exists(config_file)) {
    settings = _loadFile(config_file);
  } else {
    settings = _loadFile(default_config_file);
  }

  return settings;
};

module.exports = Config;