/**
 * Widget Upload
 *
 * Thes widgets allows the user of your applications to attach documents and files to the application
 * 
 * ### Dependencies
 *
 * ```jquery.fileupload```: This plugin uses [jQuery File upload plugin](https://github.com/blueimp/jQuery-File-Upload) to handle the file upload gracefully.
 *     Please note that the plugin is packaged within the widget so you don't have to struggle against the dependencies
 * ``` storage```: This plugin requires that you have attahed an S3 storage to your Hull application in the admin.
 * 
 * ### Templates
 *
 * * ```upload.hbs```: The main template. Because the jQuery plugin has some requirements, the template makes sure everything is set up as needed.
 * * ```upload_file_multiple```: Partial used to upload multiple files at once. Override this partial to ustomize the file upload to your needs
 * * ```upload_file_single```: Partial used to upload a single file. Override this partial to ustomize the file upload to your needs
 *
 * ### Events
 *
 * * ```hull.upload.done```: Triggered when an upload has finished. References to the uploadded files are available in an Array as the first parameter to the listeners.
 */
define(['jquery.fileupload'], {

  type: "Hull",

  templates: [
    'upload',
    'upload_file_single',
    'upload_file_multiple'
  ],

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

  uploader_events: [
    "fileuploadadd",
    "fileuploadadded",
    "fileuploadalways",
    "fileuploadchange",
    "fileuploadcompleted",
    "fileuploaddestroy",
    "fileuploaddestroyed",
    "fileuploaddone",
    "fileuploaddragover",
    "fileuploaddrop",
    "fileuploadfail",
    "fileuploadfailed",
    "fileuploadfinished",
    "fileuploadpaste",
    "fileuploadprogress",
    "fileuploadprogressall",
    "fileuploadsend",
    "fileuploadsent",
    "fileuploadstart",
    "fileuploadstarted",
    "fileuploadstop",
    "fileuploadstopped",
    "fileuploadsubmit"
  ],

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

  beforeRender: function(data) {
    data.upload_policy = this.sandbox.data.storage_policy;
    return data;
  },

  afterRender: function() {
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

    // for event in this.uploader_events
    //   do (event) =>
    //     this.form.on event, (e,d)=> this.emit(event, {event:e, data:d})

    this.form.on('fileuploadadd',       this.onAdd);
    this.form.on('fileuploaddragover',  this.onDragOver);
    this.form.on('fileuploaddrop',      this.onDrop);
    this.form.on('fileuploadsend',      this.onSend);
    this.form.on('fileuploadprogress',  this.onProgress);
    this.form.on('fileuploadfail',      this.onFail);
    this.form.on('fileuploadsuccess',   this.onSuccess);
    this.form.on('fileuploaddone',      this.onDone);

  },

  start: function() {
    this.form.fileupload('send', this.upload_data);
  },

  cancel: function() {},
  delete: function() {},

  onDrop: function() {
    this.dropzone.text('Thanks !');
    this.dropzone.removeClass('dropzone');
  },

  onDragOver: function() {
    this.dropzone.addClass('dragover');
    clearTimeout(this.dragOverEffect);
    var self = this;
    this.dragOverEffect = setTimeout(function() { self.dropzone.removeClass('dragover'); }, 100);
  },

  onAdd: function(e, data) {
    var key = this.$el.find('[name="key"]');
    var s = key.val();
    key.val(s.replace('${filename}', "/" + data.files[0].name));
    this.$el.find('[name="Filename"]').val(data.files[0].name);
    this.$el.find('[name="name"]').val(data.files[0].name);
    this.$el.find('[name="Content-Type"]').val(data.files[0].type);
    return this.upload_data = data;
  },

  onSend: function(e, data) {
    this.$el.find('.progress').fadeIn();
  },

  onProgress: function(e, data) {
    this.$el.find('.bar').css('width', data.percent+'%');
  },

  onFail: function(e, data) {
    this.$el.find('.error').text("Error :#{data.errorThrown}");
  },

  onDone: function(e, data) {
    this.$el.find('.progress').fadeOut(300, function() {});
    this.$el.find('.bar').css('width', 0);
    this.onUploadDone(data);
  },

  onUploadDone: function(data) {
    // var location = $(data.result).find('Location').text();
    // Context.app.addImage(filename: data.files[0].name)
    _.map(data.files, _.bind(function (file) {
      file.url = this.fileUrl(file.name);
    }, this));
    this.sandbox.emit('hull.upload.done', data.files);
    this.uploader.options.maxNumberOfFiles++;
  },

  multipleUpload: function() {
    return false;
    // return (this.uploader.options.maxNumberOfFiles > 1);
  },

  fileUrl: function(filename) {
    var policy = this.sandbox.data.storage_policy;
    return encodeURI(policy.url + policy.params.key.replace('${filename}', "/" + filename));
  },

  initialize: function() {
    _.bindAll(this);
  }

});
