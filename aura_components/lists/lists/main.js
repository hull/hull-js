/**
 * 
 * In Hull, a list can contain any number of objects of any type.
 * 
 * Lists can be heterogeneous, that is to say a list can contain achievements, people or comments altogether.
 *
 * @name Lists
 * @param {String} id The id of the list you want to display
 * @datasource {lists} The contents of the list
 * @template {lists} How the contents of the list should be displayed
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
