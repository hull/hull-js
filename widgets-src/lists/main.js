define({
  type: "Hull",
  templates: ['lists'],
  events: { 'submit form' : 'createList' },

  datasources: { lists: ":id/lists" },

  createList: function(e) {
    e.preventDefault();
    var self = this, inputs = {};
    this.sandbox.dom.find('input', this.$el).each(function(c, input) {
      if (input.getAttribute('type') === 'text') {
        inputs[input.getAttribute('name')] = input.value;
      }
    });
    this.api('hull/' + this.id + "/lists", 'post', inputs).then(function() { self.render() });
  }

});
