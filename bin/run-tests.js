var Mocha = require('mocha'),
	glob = require('glob'),
	path = require('path');

var mocha = new Mocha({});

var files = glob.sync('../test/**/*_test.js', { cwd: __dirname });

files.forEach(function(file) {
	file = path.join(__dirname, file);
	mocha.addFile(file);
});

/* istanbul ignore next */
mocha.run(function(failures) {
	process.on('exit', function() {
		process.exit(failures);
	});

	process.exit();
});
