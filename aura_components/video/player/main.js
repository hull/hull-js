/*global videojs:true */
Hull.component({
  datasources: {
    video: ':id'
  },
  templates: ['main'],
  require: ['//vjs.zencdn.net/4.2.1/video.js'],
  afterRender: function (data) {
    "use strict";
    videojs(data.video.id, {width: "100%", "height": "100%"});
  }
});
