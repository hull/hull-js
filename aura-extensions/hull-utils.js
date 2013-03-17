define({
  require: {
    paths: {
      moment:         'components/moment/moment',
      string:         'components/underscore.string/lib/underscore.string',
      cookie:         'components/jquery.cookie/jquery.cookie',
      base64:         'components/base64/base64'
    },
    shim: {
      string: { deps: ['underscore'] },
      cookie: { deps: ['jquery'] }
    }
  }
});
