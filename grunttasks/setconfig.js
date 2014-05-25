var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;

module.exports = function(grunt) {
    grunt.registerTask('setconfig', 'Turn on the correct config', function(target) {

        var exec = require('child_process').exec;

        var fileName = target;

        var cb = this.async();
        exec('cp ' + fileName + '.js ../config.js', {cwd: './configs'}, function(err, stdout, stderr) {

            if (err) {
                grunt.log.error("Failed to copy config");
            }
            console.log(stderr);
            console.log("Config file for node front is set for", fileName);
            cb();

        });

    });

};
