define(['sandbox'], function(sandbox) {
  return sandbox.widgets.create({
    templates: ['collections'],
    namespace: 'collections',

    events: {
      'submit form' : 'createCollection'
    },

    datasources: {
      collections: function() {
        return this.data.api("hull/" + this.id + "/collections");
      }
    },

    createCollection: function(e) {
      e.preventDefault();
      var self = this, inputs = {};
      this.dom.find('input', this.$el).each(function(c, input) {
        if (input.getAttribute('type') === 'text') {
          inputs[input.getAttribute('name')] = input.value;
        }
      });
      this.data.api.post('hull', this.id + "/collections", inputs).then(function() { self.render() });
    }

  });
});
