/* global videojs:true */

Hull.component({
  datasources: {
    video: ':id'
  },

  templates: ['main'],

  require: ['//vjs.zencdn.net/4.2.1/video.js'],

  initialize: function() {
    this.trackPlayer = this.sandbox.util._.throttle(function(player) {
      var progress = Math.round((player.currentTime() / player.duration()) * 100);

      var event;
      if (progress > 10 && progress < 80 && !this.playTracked) {
        this.playTracked = true;
        event = 'video.play';
      } else if (progress >= 80 && !this.completeTracked) {
        this.completeTracked = true;
        event = 'video.complete';
      }

      if (event) { this.track(event, { id: this.options.id }); }
    }, 500);
  },

  beforeRender: function(data) {
    this.currentState = this.currentState || data.video.state;

    data.isProcessing = this.isProcessing(data.video.state);
    data.hasFailed = this.hasFailed(data.video.state);
    data.isFinished = data.video.state === 'finished';

    if (data.isFinished) {
      var mp4 = data.video.files[this.options.quality] || data.video.files.standard;

      data.poster = data.video.picture || data.video.thumbnails[0];
      data.hls = data.video.base_url + '/' + data.video.files.hls.name;
      data.mp4 = data.video.base_url + '/' + mp4.name;
      data.width = mp4.width;
      data.height = mp4.height;
    }
  },

  afterRender: function (data) {
    if (this.isProcessing(data.video.state)) {
      this.poll(data.video.id);
    } else {
      var options = {
        width: this.options.width || data.width,
        height: this.options.height || data.height
      };

      var self = this;
      videojs(data.video.id, options).on('timeupdate', function() {
        self.trackPlayer(this);
      });
    }
  },

  poll: function(id) {
    var _ = this.sandbox.util._;

    this.api(id).then(_.bind(function(video) {
      if (this.currentState !== video.state) {
        this.currentState = video.state;
        this.render();
      }

      if (this.isProcessing(video.state)) {
        var delay = this.options.delay || 10000;
        setTimeout(_.bind(this.poll, this), delay, id);
      }
    }, this));
  },

  isProcessing: function(state) {
    return this.sandbox.util._.include([
      'pending',
      'scheduled',
      'submitted',
      'waiting',
      'processing'
    ], state);
  },

  hasFailed: function(state) {
    return this.sandbox.util._.include([
      'submition_failed',
      'submition_error',
      'failed',
      'canceled'
    ], state);
  }
});
