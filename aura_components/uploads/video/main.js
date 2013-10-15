Hull.component({
  type: 'Hull',

  templates: ['upload', 'file'],

  require: ['jquery.fileupload'],

  initialize: function() {
  },

  beforeRender: function() {
  },

  afterRender: function() {
    var self = this;
    var _ = this.sandbox.util._;

    this.$upload = this.$('form');

    this.$upload.fileupload({
      acceptFileTypes: /(\.|\/)(mov|mkv|mpg|wmv|mp4|m4v)$/i,

      dataType: 'xml',

      add: function(event, data) {
        var f = _.pick(data.files[0], 'name', 'type', 'size');
        self.api('app/videos/authorize', { file: f }, 'post').then(function(r) {
          self.postProcessPath = r.postprocess_path;
          self.postProcessParams = r.postprocess_params;

          self.$upload[0].setAttribute('action', r.credentials.url);
          self.$upload.find('[name="Filename"]').val(f.name);

          // TODO ensure that we do not create to field with the same name
          _.each(r.credentials.params, function(v, k) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = k;
            input.value = v;

            self.$upload.append(input);
          });

          data.submit();
        });
      },

      send: function() {
        console.log('Start upload');
      },

      progress: function(event, data) {
        console.log('PROGRESS');
      },

      fail: function(event, data) {
        console.log('Fail', data);
      },

      done: function(event, data) {
        var url = self.postProcessPath, params = self.postProcessParams;
        self.api(url, params, 'post').then(function(video) {
          self.pollVideo(video.id);
        });
      }
    });
  },

  pollVideo: function(id) {
    var _ = this.sandbox.util._;
    this.api(id).then(_.bind(function(video) {
      if (video.state === 'finished') { return; }

      if (_.isFunction(this.stateHandlers[video.state])) {
        this.stateHandlers[video.state].call(this, video);
      }

      setTimeout(_.bind(this.pollVideo, this), 5000, id);
    }, this));
  },

  stateHandlers: {
    processing: function(video) {
      console.log('Processing', video);
    },

    finished: function(video) {
      console.log('Finished', video);
    },

    failed: function(video) {
      console.log('Failed', video);
    }
  }
});
