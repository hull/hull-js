module.exports = function(config) {
  config.set({
    basePath: '',
    plugins: [
      'karma-coffee-preprocessor',
      'karma-mocha',
      'karma-requirejs',
      'karma-phantomjs-launcher',
      'karma-spec-reporter',
      'karma-chai-sinon'
    ],
    autoWatch: true,
    frameworks: ['mocha', 'requirejs', 'chai-sinon'],
    files: [
      'spec/runner.js',
      { pattern: 'spec/support/**/*.js', included: false },
      { pattern: 'bower_components/**/*.js', included: false },
      { pattern: 'aura-extensions/**/*.js', included: false },
      { pattern: 'src/**/*.coffee', included: false },
      { pattern: 'lib/**/*.js', included: false },
      { pattern: 'spec/**/*_spec.js', included: false }
    ],
    browsers: ['PhantomJS'],
    reporters: ['spec', 'coverage'],
    logLevel: config.LOG_DISABLE,
    preprocessors: {
      'src/**/*.coffee': ['coffee']
    },
    coffeePreprocessor: {
      options: {
        bare: false,
        sourceMap: false
      },
      transformPath: function(path) {
        return path.replace(/\.coffee$/, '.js').replace(/\/src\//, '/lib/');
      }
    },
    singleRun: true
  });
};
