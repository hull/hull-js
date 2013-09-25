/**
 * ##Lists/create
 *
 * Allows to create a list. The list will be owned by the current user.
 *
 * ### Templates
 *
 * * `form`: How the contents of the list should be displayed
 *
 * ### Events:
 *
 * `form submit`: When the user submits the form included in the template, a list is created with the properties defined in the forms
 */

/*global Hull:true */
Hull.define({
  type: 'Hull',
  templates: ['form'],
  refreshEvents: ['model.hull.me.change'],
  actions: {
    createList: function (e) {
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
