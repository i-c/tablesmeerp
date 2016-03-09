module.exports = function (grunt) {
  grunt.initConfig({
    bump: {
      options: {
        pushTo: 'origin'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'index.js', 'bin/**/*.js']
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('default', ['jshint']);
};
