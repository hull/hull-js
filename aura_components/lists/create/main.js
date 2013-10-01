/**
 * Create a list owned by the current user.
 * 
 * @name Create
 * @template {form} How the contents of the list should be displayed
 * @example <div data-hull-component="lists/create@hull"></div>
 */

/*global Hull:true */
Hull.define({
  type: 'Hull',
  templates: ['form'],
  refreshEvents: ['model.hull.me.change'],
  actions: {
    create: function (e) {
      "use strict";
      e.preventDefault();
      var self = this, inputs = {};
      this.$find('input', this.$el).each(function(c, input) {
        if (input.getAttribute('type') === 'text') {
          inputs[input.getAttribute('name')] = input.value;
        }
      });
      if (inputs.name) {
        this.api('me/lists', 'post', inputs).then(function() { self.render(); });
      } else {
        inputs.errorNoName = true;
        this.render('form', inputs);
      }
    }
  }
});
