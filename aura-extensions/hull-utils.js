define({
  config: {
    require: {
      paths: {
        moment:         'components/moment/moment',
        string:         'components/underscore.string/lib/underscore.string'
      },
      shim: {
        string: { deps: ['underscore'] }
      }
    }
  }
});
