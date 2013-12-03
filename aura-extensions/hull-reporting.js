define(['lib/api/api'], function(api) {

  var module = {
    initialize: function(app){
      var _ = app.core.util._;
      api.promise.then(function(apiObject) {
        var reporting = {
          track: function(eventName, params) {
            var data;
            data = _.extend({
              url: window.location.href,
              referrer: document.referrer
            }, params);
            return apiObject.api({
              provider: "track",
              path: eventName
            }, 'post', data);
          },
          flag: function(id) {
            return apiObject.api({
              provider: "hull",
              path: [id, 'flag'].join('/')
            }, 'post');
          }
        };
        app.core.reporting = reporting;
      });
      return true
    }
  }
});
