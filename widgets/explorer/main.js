define(['./prism'], {
  type: "Hull",
  templates: ["explorer"],
  actions: {
    get: function() {
      var self = this;
      var path = this.sandbox.dom.find("input", this.$el).val();
      self.sandbox.dom.find("code", self.$el).text('loading...');
      this.api(path).then(function(response) {
        var prettyJson = JSON.stringify(response, null, "\t").replace(/\n/g, "<br>")
        self.sandbox.dom.find("code", self.$el).html(prettyJson);
      });
    }
  }
});
