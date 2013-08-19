/**
 * ##Lists
 *
 * In Hull, a list can contain any number of objects of any type. Lists can be heterogeneous, that is to say a list can contain achievements, people or comments altogether.
 *
 * ### Options
 *
 * `id`: The id of the list you want to display
 *
 * ### Templates
 *
 * * `lists`: How the contents of the list should be displayed
 *
 * ### Datasources
 *
 * `lists`: Contains the contents of the list for which the component has been instantiated
 *
 * ### Events:
 *
 * `form submit`: When the user submits the form included in the template, a list is created with the properties defined in the forms
 *
 * @TODO Don't use DOM events, use component acions instead
 */
Hull.define({
  type: "Hull",
  templates: ['lists'],
  refreshEvents: ['model.hull.me.change'],
  events: { 'submit form' : 'createList' },

  datasources: {
    lists: ":id/lists"
  },

  createList: function(e) {
    e.preventDefault();
    var self = this, inputs = {};
    this.sandbox.dom.find('input', this.$el).each(function(c, input) {
      if (input.getAttribute('type') === 'text') {
        inputs[input.getAttribute('name')] = input.value;
      }
    });
    this.api(this.id + '/lists', 'post', inputs).then(function() { self.render(); });
  }

});
