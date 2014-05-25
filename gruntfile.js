/*global module:false*/

var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: '<json:package.json>',

        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */'
        },

        watch: {
            styles: {
                files: ['**/*.styl'],
                tasks: ['stylus']
            }
        }

    });

    grunt.registerTask('stylus', 'make the css', function() {

        var done = this.async();
        var stylus = require('stylus');
        var autoprefixer = require('autoprefixer');
        var stylusPaths = grunt.file.expand([ 'public/**/*.styl' ]);

        function process(list) {
            var stylFile = list.shift();
            if (stylFile) {
                var css = fs.readFileSync(stylFile).toString();
                stylus(css)
                    .set('filename', stylFile)
                    .set('include css', true)
                    .set('compress', false)
                    .render(function(err, output){
                        if (err) {
                            return done(err);
                        }
                        var prefixed = autoprefixer.process(output).css;
                        var cssFile = stylFile.replace(".styl", ".css");
                        fs.writeFileSync(cssFile, prefixed, 'utf8');
                        grunt.log.ok("Created '" + cssFile + "'");
                        process(list);
                    });
            } else {
                done();
            }
        }

        process(stylusPaths);

    });

    grunt.registerTask('version', 'create version file', function() {
        var done = this.async();
        var versionCommand = "git show -s --format=%h";
        exec(versionCommand, function (err, stdout, stderr) {
            var versionHash = stdout.toString().replace(/[\n\r]/g, '');
            var countCommand = "git rev-list HEAD --count";
            exec(countCommand, function (err, stdout, stderr) {
                var count = stdout.toString().replace(/[\n\r]/g, '');
                var version = count + "-" + versionHash;
                fs.writeFileSync("version.txt", version, "utf8");
                grunt.log.ok("Version", version);
                done();
            });
        });
        return "";

    });

    grunt.registerTask('start', 'Start the node front server', function() {

        var done = this.async();
        var front = require('./index');
        front.init(function() {
            console.log("");
            console.log("Node server started");
        });

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadTasks("grunttasks");

    grunt.registerTask('build', function(inputTarget) {
        var inputTarget = inputTarget || 'development';

        var target = "";
        if (inputTarget == "production") {
            target = "production";
        } else if (inputTarget == "development") {
            target = "development";
        } else if (inputTarget == "local") {
            target = "local";
        } else {
            grunt.log.error("Config settings is not accepeted, use production or development");
            return false;
        }

        var targetTasks = ['setconfig'];
        var tasks = ['stylus', 'version'];
        targetTasks = targetTasks.map(function(task) {
            return task + ":" + target;
        });
        tasks = targetTasks.concat(tasks);
        grunt.task.run.apply(grunt.task, tasks);
    });


}
