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
  },
  initialize: function(app) {
    app.core.util.base64 = {
      decode: function(input, urlsafe) {
        if (urlsafe) {
          input = input.replace(/\+/g, '-').replace(/\//g, '_')
        }
        return window.atob(input);
      },
      encode: function(input, urlsafe) {
        var ret = window.btoa(input);
        if (urlsafe) {
          ret = ret.replace(/\+/g, '-').replace(/\//g, '_')
        }
        return ret;
      }
    };

    app.core.dom.getFormData = function(form) {
      var formData = {};
      app.sandbox.util._.each($(form).serializeArray(), function(field) {
        formData[field.name] = field.value;
      });
      return formData;
    }
  }
});
