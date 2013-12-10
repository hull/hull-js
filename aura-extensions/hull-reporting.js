define(['lib/api/reporting'], function(api) {
  return {
    initialize: function(app) {
      app.core.reporting = api;
    }
  };
});
