var Mocha = require('mocha')
  , fs = require('fs')
  , path = require('path');

var mocha = new Mocha({});

var dir = path.join(__dirname, '../test');

fs.readdirSync(dir)
    .filter(function(file) {
        return file.substr(-8) === '_test.js';
    })
    .forEach(function(file) {
        mocha.addFile(path.join(dir, file));
    });

/* istanbul ignore next */
mocha.run(function(failures) {
    process.on('exit', function() {
        process.exit(failures);
    });
});
