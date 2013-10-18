Hull.component({
  type: 'Hull',

  templates: ['upload', 'file'],

  require: ['jquery.fileupload'],

  initialize: function() {
    this.currentState = 'pending';
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
        self.api(self.options.id + '/videos/authorize', { file: f }, 'post').then(function(r) {
          self.postProcessPath = r.postprocess_path;
          self.postProcessParams = r.postprocess_params;

          self.$upload[0].setAttribute('action', r.credentials.url);
          _.each(r.credentials.params, function(v, k) {
            self.$upload.find('[name="' + k + '"]').val(v);
          });

          data.submit();
        });
      },

      done: function(event, data) {
        self.api(self.postProcessPath, self.postProcessParams, 'post').then(function(video) {
          self.pollVideo(video.id);
        });
      }
    }).on([
      'fileuploadadd',
      'fileuploadsubmit',
      'fileuploadsend',
      'fileuploadfail',
      'fileuploadalways',
      'fileuploadprogress',
      'fileuploadprogressall',
      'fileuploadstart',
      'fileuploadstop',
      'fileuploadchange',
      'fileuploadpaste',
      'fileuploaddrop',
      'fileuploaddragover',
      'fileuploadchunksend',
      'fileuploadchunkdone',
      'fileuploadchunkfail',
      'fileuploadchunkalways',
      'fileuploadprocessstart',
      'fileuploadprocess',
      'fileuploadprocessdone',
      'fileuploadprocessfail',
      'fileuploadprocessalways',
      'fileuploadprocessstop'
    ].join(' '), function(e, data) {
      var name = e.type.replace('fileupload', '');
      self.sandbox.emit('hull.uploads.video.' + name, data);
    });
  },

  pollVideo: function(id) {
    var _ = this.sandbox.util._;
    this.api(id).then(_.bind(function(video) {
      if (video.state !== this.currentState) {
        this.currentState = video.state;
        this.sandbox.emit('hull.encoding.video.state.change', video);
      }

      if (video.state === 'finished') { return; }

      setTimeout(_.bind(this.pollVideo, this), 5000, id);
    }, this));
  }
});
