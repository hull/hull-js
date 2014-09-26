/**
 * Allows the user of your applications to attach video to a given object.
 *
 * This component proxify all event emited by jQuery.fileupload. For example fileuploadadd becomes hull.uploads.video.add. To see all fileupload events checkout the plugin documentation. https://github.com/blueimp/jQuery-File-Upload/wiki/Options
 *
 * @name Video Upload
 * @param {String} id Required The object ID on which to attach the video.
 * @tmpl {upload} The main template. Because the jQuery plugin has some requirements, the template makes sure everything is set up as needed.
 * @event {hull.uploads.progress} Triggered when an upload is in progress. The total amount of data as well as the current amount of data transfered are in the payload of the event.
 * @event {hull.uploads.video.finished} Triggered when upload is done and video is created.
 * @example <div data-hull-component="uploads/video@hull" data-hull-id="me"></div>
 */

Hull.component({
  type: 'Hull',

  templates: ['upload'],

  require: ['fileupload'],

  afterRender: function() {
    var self = this;
    var _ = this.sandbox.util._;

    this.$upload = this.$('form');

    this.$upload.fileupload({
      acceptFileTypes: /(\.|\/)(mov|mkv|mpg|wmv|mp4|m4v)$/i,

      dataType: 'xml',

      add: function(event, data) {
        var f = _.pick(data.files[0], 'name', 'type', 'size');
        var root = self.options.id || "me";
        self.api(root + '/videos/authorize', { file: f }, 'post').then(function(r) {
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
          self.sandbox.emit('hull.uploads.video.finished', video);
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
      self.sandbox.emit('hull.uploads.video.' + name, { event: e, data: data });
    });
  }
});
