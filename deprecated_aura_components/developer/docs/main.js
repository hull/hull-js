/**
 * 
 * Fetches and format an API documentation
 *
 * @name API Doc
 * @param {String} api The endpoint you want to fetch
 * @example 
 */
Hull.component({
  type: "Hull",

  templates: ['docs'],

  datasources: {
    all: 'docs/all',
    doc: function() {
      if (this.options.api) {
        return this.api('docs/' + this.options.api);
      }
    }
  },

  actions: {
    showDetails: function(e, params) {
      this.options.api = params.data.api;
      this.render();
    }
  }

});
