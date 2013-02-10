define({
  type: "Hull",

  templates: ['docs'],

  datasources: {
    all: function() {
      return this.api('hull/docs/all');
    },
    doc: function() {
      if (this.options.api) {
        return this.api('hull/docs/' + this.options.api);
      }
    }
  },

  actions: {
    showDetails: function(s,e,d) {
      this.options.api = d.api;
      this.render();
    }
  }

});
