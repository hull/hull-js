/**
 *
 * Allow users to add and remove objects from lists.
 * Lists are created on the fly, with the `list` you specify.
 *
 * @name Button
 * @param {String} list The name of the list you want to show. List will automatically be created if it does not exist yet.
 * @tmpl {button} Shows the button with the right state
 * @example <div data-hull-component="lists/button@hull" data-hull-id="app" data-hull-list="favorites"></div>
 * @example <div data-hull-component="lists/button@hull" data-hull-id="HULL_ID" data-hull-list="favorites"></div>
 * @example <div data-hull-component="lists/button@hull" data-hull-id="entity:ANY_UNIQUE_ID" data-hull-list="favorites"></div>
 */

Hull.component({
  type: 'Hull',

  refreshEvents: ['model.hull.me.change'],

  templates: ["button"],

  options: {
    list: 'likes'
  },

  requiredOptions: ['list'],

  datasources: {
    list: function() {
      return this.api.model("me/lists/" + this.options.list).fetch();
    },
    target: ":id"
  },

  beforeRender: function(data) {
    this.id = data.target.id;
    var self = this;
    var _ = this.sandbox.util._;
    if (data.list && data.list.items) {
      var itemIds   = _.pluck(data.list.items, "id");
      data.isListed = _.include(itemIds, this.id);
      self.itemPath = data.list.id + "/items/" + data.target.id;
    }
  },

  toggle: function(verb) {
    var list = this.data.list;
    var method = verb === 'remove' ? 'delete' : 'post';
    var self = this;
    var _ = this.sandbox.util._;
    this.api(this.itemPath, method).then(function() {
      this.render();
    }.bind(this));
  },

  actions: {
    add: function() {
      this.toggle('add');
    },
    remove: function() {
      this.toggle('remove');
    }
  }

});
