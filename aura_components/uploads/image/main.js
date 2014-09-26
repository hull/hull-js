/**
 * Allows the user of your applications to attach documents and files to the application.
 *
 * @name Upload Image
 * @dependency {jquery.fileupload} This plugin uses [jQuery File upload plugin](https://github.com/blueimp/jQuery-File-Upload) to handle the file upload gracefully. Please note that the plugin is packaged within the component so you don't have to struggle against the dependencies.
 * @param {String} id Required The object ID on which to attach the image
 * @tmpl {upload}               The main template. Because the jQuery plugin has some requirements, the template makes sure everything is set up as needed.
 * @tmpl {file}   used to upload a single file. Override this partial to Customize the file upload to your needs.
 * @event {hull.uploads.send}     Triggered when an upload has started.
 * @event {hull.uploads.progress} Triggered when an upload is in progress. The total amount of data as well as the current amount of data transfered are available in the payload of the event.
 * @event {hull.uploads.finished} Triggered when an upload has finished. References to the uploadded files are available in an Array as the first parameter to the listeners.
 * @example <div data-hull-component="uploads/image@hull" data-hull-id="me"></div>
 */

Hull.component({
  type: 'Hull',

  templates: [ 'upload', 'file' ],

  require:['fileupload'],

  requiredOptions:['storage'],

  options: {
    storage:'hull'
  },

  fileTypes: {
    images :  /(\.|\/)(gif|jpe?g|png)$/i,
    videos :  /(\.|\/)(mov|mkv|mpg|wmv|mp4|m4v)$/i
  },

  fileProcessors: {
    images: [
      { action: 'load', fileTypes: /^image\/(gif|jpeg|png)$/, maxFileSize: 20000000 },
      { action: 'resize', maxWidth: 1440, maxHeight: 900 },
      { action: 'save' }
    ]
  },

  uploader_events: {
    'fileuploadadd'        : 'onAdd',
    'fileuploadadded'      : 'onAdded',
    'fileuploadalways'     : 'onAlways',
    'fileuploadchange'     : 'onChange',
    'fileuploadcompleted'  : 'onCompleted',
    'fileuploaddestroy'    : 'onDestroy',
    'fileuploaddestroyed'  : 'onDestroyed',
    'fileuploaddone'       : 'onDone',
    'fileuploaddragover'   : 'onDragover',
    'fileuploaddrop'       : 'onDrop',
    'fileuploadfail'       : 'onFail',
    'fileuploadfailed'     : 'onFailed',
    'fileuploadfinished'   : 'onFinished',
    'fileuploadpaste'      : 'onPaste',
    'fileuploadprogress'   : 'onProgress',
    'fileuploadprogressall': 'onProgressAll',
    'fileuploadsend'       : 'onSend',
    'fileuploadsent'       : 'onSent',
    'fileuploadstart'      : 'onStart',
    'fileuploadstarted'    : 'onStarted',
    'fileuploadstop'       : 'onStop',
    'fileuploadstopped'    : 'onStopped',
    'fileuploadsubmit'     : 'onSubmit'
  },

  uploader_options: {
    autoUpload : true,
    maxNumberOfFiles:1,
    maxFileSize: 5000000,
    minFileSize:0,
    dropZone: '.dropzone',
    type : 'POST'
    // previewSourceMaxFileSize: 5000000
    // previewMaxWidth: 80
    // previewMaxHeight: 80
  },

  selectStoragePolicy: function () {
    var storagePolicies = [],
        selectedPolicy,
        optionValue = this.options.storage;
    if (this.sandbox.config.services.storage) {
      storagePolicies = this.sandbox.util._.keys(this.sandbox.config.services.storage);
    }
    var countPolicies = storagePolicies.length;
    if (countPolicies === 1) {
      selectedPolicy = storagePolicies[0];
    } else if (countPolicies > 1) {
      if (!optionValue) {
        throw new TypeError('You must specify a storage policy.');
      }
      if (storagePolicies.hasOwnProperty(optionValue)) {
        selectedPolicy = storagePolicies[optionValue];
      } else {
        throw new TypeError('Unknown storage policy: ', optionValue);
      }
    } else {
      // console.warn('No storage policy declared for the app. Unable to save the pictures.');
    }

    return this.sandbox.config.services.storage[selectedPolicy];
  },

  beforeRender: function (data) {
    data.upload_policy = this.selectStoragePolicy();
    return data;
  },

  afterRender: function () {
    var _ = this.sandbox.util._;
    this.form = this.$el.find('form');

    var opts = _.defaults(this.uploader_options, {
      dataType:         'xml',
      url:              this.form.attr('action'),
      dropZone:         this.$el.find(this.uploader_options.dropZone),
      acceptFileTypes:  this.fileTypes.images
    });

    this.form.fileupload(opts);
    this.uploader = this.form.data('fileupload');
    this.dropzone = this.$el.find(this.uploader_options.dropZone);

    var emit = this.sandbox.emit, form = this.form;

    _.each(this.uploader_events, function(cb, evt) {
      var n = evt.replace(/^fileupload/, '');
      form.on(evt, function(e,d) {
        var eventName = 'hull.uploads.image.' + n;
        emit('hull.upload.image.' + n, { event: e, data: d });
      });
    });

    _.each(this.uploader_events,function(value, key){
      if(this[value]){
        this.form.on(key, _.bind(this[value],this));
      }
    },this);
  },

  start: function () {
    this.form.fileupload('send', this.upload_data);
  },

  cancel: function () {},

  'delete': function () {},

  onSuccess: function () {
    this.dropzone.find('b').text('Thanks !');
    this.dropzone.removeClass('dropzone');
  },

  onDrop: function () {
    this.dropzone.find('b').text('Thanks !');
    this.dropzone.removeClass('dropzone');
  },

  onDragOver: function () {
    this.dropzone.addClass('dragover');
    clearTimeout(this.dragOverEffect);
    var self = this;
    this.dragOverEffect = setTimeout(function () { self.dropzone.removeClass('dragover'); }, 100);
  },

  onAdd: function (e, data) {
    var key = this.$el.find('[name="key"]');
    var s = key.val();
    key.val(s.replace('${filename}', "/" + data.files[0].name));
    this.$el.find('[name="Filename"]').val(data.files[0].name);
    this.$el.find('[name="name"]').val(data.files[0].name);
    this.$el.find('[name="Content-Type"]').val(data.files[0].type);
    return this.upload_data = data;
  },

  onSend: function (e, data) {
    this.$el.find('.progress').fadeIn();
  },

  onSubmit: function (e, data) {
    this.toggleDescription();
  },

  toggleDescription: function () {
    var descriptionElt = this.$el.find('[name=description]');
    if (descriptionElt.is(':disabled')) {
      descriptionElt.removeAttr('disabled');
      descriptionElt.val('');
    } else {
      this.description = descriptionElt.val() || undefined;
      this.$el.find('[name=description]').attr('disabled', 'disabled');
    }
  },

  onProgress: function (e, data) {
    this.$el.find('.bar').css('width', data.percent + '%');
  },

  onFail: function (e, data) {
    this.$el.find('.error').text('Error :#{data.errorThrown}');
  },

  onDone: function (e, data) {
    this.$el.find('[data-hull-progress]').fadeOut(300, function () {});
    this.$el.find('[data-hull-progress-bar]').css('width', 0);
    this.onUploadDone(data);
  },

  onUploadDone: function (data) {
    var _ = this.sandbox.util._;

    _.map(data.files, _.bind(function (file) {

      file.url = this.fileUrl(file.name);
      file.description = this.description;
      var root = this.options.id || 'me';
      this.api(root + '/images', 'post', {
        description: file.description,
        source_url: file.url,
        name: file.name
      }).then(function (image) {
        this.sandbox.emit('hull.uploads.image.finished', image);
      }.bind(this));

    }, this));

    this.toggleDescription();
    this.uploader.options.maxNumberOfFiles++;
  },

  multipleUpload: function () {
    // return (this.uploader.options.maxNumberOfFiles > 1);
    return false;
  },

  fileUrl: function (filename) {
    var policy = this.selectStoragePolicy();
    return encodeURI(policy.url + policy.params.key.replace('${filename}', '/' + filename));
  },

  initialize: function () {}
});
