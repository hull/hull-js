/*global define:true */
define(['lib/utils/cookies'], function(cookies) {

  var extension = {
    initialize: function(app){
      app.core.cookies = cookies;
    }
  };

  return extension;
});
