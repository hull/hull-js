define({
  config: {
    require: {
      paths: {
        moment:         'moment/moment',
        string:         'underscore.string/lib/underscore.string'
      },
      shim: {
        string: { deps: ['underscore'] }
      }
    }
  }
});
