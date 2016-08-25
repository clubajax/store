var path = require('path');

module.exports = function (grunt) {

    grunt.initConfig({
        uglify:{
            main:{
                files: {
                    'dist/store.min.js': ['dist/store.js']
                }
            },
            options:{
                mangle: false,
                beautify: true,
                indentStart: 0,
                indentLevel: 0
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', function () {
        require('./scripts/compile.js');
        grunt.task.run('uglify');
    });
};