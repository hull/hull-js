define({
    type: "Hull",
    templates: [ "upload", "upload_file_single", "upload_file_multiple" ],
    fileTypes: {
        images: /(\.|\/)(gif|jpe?g|png)$/i,
        videos: /(\.|\/)(mov|mkv|mpg|wmv|mp4|m4v)$/i
    },
    fileProcessors: {
        images: [ {
            action: "load",
            fileTypes: /^image\/(gif|jpeg|png)$/,
            maxFileSize: 2e7
        }, {
            action: "resize",
            maxWidth: 1440,
            maxHeight: 900
        }, {
            action: "save"
        } ]
    },
    uploader_events: [ "fileuploadadd", "fileuploadadded", "fileuploadalways", "fileuploadchange", "fileuploadcompleted", "fileuploaddestroy", "fileuploaddestroyed", "fileuploaddone", "fileuploaddragover", "fileuploaddrop", "fileuploadfail", "fileuploadfailed", "fileuploadfinished", "fileuploadpaste", "fileuploadprogress", "fileuploadprogressall", "fileuploadsend", "fileuploadsent", "fileuploadstart", "fileuploadstarted", "fileuploadstop", "fileuploadstopped", "fileuploadsubmit" ],
    uploader_options: {
        autoUpload: true,
        maxNumberOfFiles: 1,
        maxFileSize: 5e6,
        minFileSize: 0,
        dropZone: ".dropzone",
        type: "POST"
    },
    beforeRender: function(data) {
        data.upload_policy = this.sandbox.data.storage_policy;
        return data;
    },
    afterRender: function() {
        this.form = this.$el.find("form");
        var opts = _.defaults(this.uploader_options, {
            dataType: "xml",
            url: this.form.attr("action"),
            dropZone: this.$el.find(this.uploader_options.dropZone),
            acceptFileTypes: this.fileTypes.images
        });
        this.form.fileupload(opts);
        this.uploader = this.form.data("fileupload");
        this.dropzone = this.$el.find(this.uploader_options.dropZone);
        this.form.on("fileuploadadd", this.onAdd);
        this.form.on("fileuploaddragover", this.onDragOver);
        this.form.on("fileuploaddrop", this.onDrop);
        this.form.on("fileuploadsend", this.onSend);
        this.form.on("fileuploadprogress", this.onProgress);
        this.form.on("fileuploadfail", this.onFail);
        this.form.on("fileuploadsuccess", this.onSuccess);
        this.form.on("fileuploaddone", this.onDone);
    },
    start: function() {
        this.form.fileupload("send", this.upload_data);
    },
    cancel: function() {},
    "delete": function() {},
    onDrop: function() {
        this.dropzone.text("Thanks !");
        this.dropzone.removeClass("dropzone");
    },
    onDragOver: function() {
        this.dropzone.addClass("dragover");
        clearTimeout(this.dragOverEffect);
        var self = this;
        this.dragOverEffect = setTimeout(function() {
            self.dropzone.removeClass("dragover");
        }, 100);
    },
    onAdd: function(e, data) {
        var key = this.$el.find('[name="key"]');
        var s = key.val();
        key.val(s.replace("${filename}", "/" + data.files[0].name));
        this.$el.find('[name="Filename"]').val(data.files[0].name);
        this.$el.find('[name="name"]').val(data.files[0].name);
        this.$el.find('[name="Content-Type"]').val(data.files[0].type);
        return this.upload_data = data;
    },
    onSend: function(e, data) {
        this.$el.find(".progress").fadeIn();
    },
    onProgress: function(e, data) {
        this.$el.find(".bar").css("width", data.percent + "%");
    },
    onFail: function(e, data) {
        this.$el.find(".error").text("Error :#{data.errorThrown}");
    },
    onDone: function(e, data) {
        this.$el.find(".progress").fadeOut(300, function() {});
        this.$el.find(".bar").css("width", 0);
        this.onUploadDone(data);
    },
    onUploadDone: function(data) {
        if (data.files[0] && data.files[0].type && data.files[0].type.split("/")[0] === "image") {
            var source_url = this.fileUrl(data.files[0].name);
            this.api("hull/me/images", "post", {
                source_url: source_url,
                name: data.files[0].name
            });
        }
        this.uploader.options.maxNumberOfFiles++;
    },
    multipleUpload: function() {
        return false;
    },
    fileUrl: function(filename) {
        var policy = this.sandbox.data.storage_policy;
        return encodeURI(policy.url + policy.params.key.replace("${filename}", "/" + filename));
    },
    initialize: function() {
        _.bindAll(this);
    }
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["upload/upload"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    partials = partials || Handlebars.partials;
    data = data || {};
    var buffer = "", stack1, stack2, foundHelper, functionType = "function", escapeExpression = this.escapeExpression, self = this, helperMissing = helpers.helperMissing, blockHelperMissing = helpers.blockHelperMissing;
    function program1(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += '\n  <form action="';
        foundHelper = helpers.url;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.url;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '" method="post" enctype="multipart/form-data" class="hull_upload">\n\n    ';
        stack1 = depth0.params;
        stack2 = {};
        foundHelper = helpers.key_value;
        stack1 = foundHelper ? foundHelper.call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(2, program2, data),
            data: data
        }) : helperMissing.call(depth0, "key_value", stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(2, program2, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n\n    <div class="dropzone well hidden-phone hidden-phone-tablet" height="100px;" width="100px;">Drop an image here</div>\n\n    <input type="hidden" name="Filename" value=""/>\n    <input type="hidden" name="Content-Type" value=""/>\n    <input type="hidden" name="name" value=""/>\n\n    <div class="fileupload-buttonbar row-fluid">\n      <div class=\'span12\'>\n        ';
        stack1 = depth0;
        stack1 = self.invokePartial(partials.upload_file_single, "upload_file_single", stack1, helpers, partials, data);
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n      </div>\n    </div>\n\n    <div class="fileupload-progress fade row-fluid">\n      <div class=\'span12\'>\n        <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">\n          <div class="bar" style="width:0%;"></div>\n        </div>\n        <div class="progress-extended">&nbsp;</div>\n      </div>\n    </div>\n\n\n    <div class=\'error\'></div>\n    <div class=\'filescontainer\'></div>\n  </form>\n';
        return buffer;
    }
    function program2(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += '\n      <input type="hidden" name="';
        foundHelper = helpers.key;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.key;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '" value="';
        foundHelper = helpers.value;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.value;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"/>\n    ';
        return buffer;
    }
    buffer += "\n";
    foundHelper = helpers.upload_policy;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
    } else {
        stack1 = depth0.upload_policy;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.upload_policy) {
        stack1 = blockHelperMissing.call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
    }
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n";
    return buffer;
});

this["Hull"]["templates"]["_default"]["upload/upload_file_multiple"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    return '  <span class="btn btn-success fileinput-button"> <i class="icon-plus icon-white"></i> <span>Add files...</span> <input type="file" name="files[]" multiple=""> </span>\n  <button type="submit" data-hull-action="start" class="btn btn-primary start"> <i class="icon-upload icon-white"></i> <span>Start upload</span> </button>\n  <button type="reset" data-hull-action="cancel" class="btn btn-warning"> <i class="icon-ban-circle icon-white"></i> <span>Cancel upload</span> </button>\n  <button type="button" data-hull-action="delete" class="btn btn-danger"> <i class="icon-trash icon-white"></i> <span>Delete</span> </button>\n  <input type="checkbox" class="toggle">\n';
});

this["Hull"]["templates"]["_default"]["upload/upload_file_single"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    return '<span class="btn btn-success fileinput-button">\n  <i class="icon-plus icon-white"></i>\n  <span>Add files...</span>\n  <input type="file" name="file" accept="image/*" capture="camera">\n</span>\n';
});