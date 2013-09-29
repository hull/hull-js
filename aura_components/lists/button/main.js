/**
 * 
 * Allow users to add and remove objects from lists.
 * Lists are created on the fly, with the `list-name` you specify.
 *
 * @name Button
 * @param {String} list-name The name of the list you want to show. List will automatically be created if it does not exist yet.
 * @param {String} id/uid The ID of the object you want to add / remove to the list. UIDs will be created as external entities
 * @template {button} Shows the button with the right state
 * @example <div data-hull-component="list_button@hull" data-hull-id="app" data-hull-list-name="favorites"></div>
 * @example <div data-hull-component="list_button@hull" data-hull-id="HULL_ID" data-hull-list-name="favorites"></div>
 * @example <div data-hull-component="list_button@hull" data-hull-uid="ANY_UNIQUE_ID" data-hull-list-name="favorites"></div>
 */

Hull.define({
  type: "Hull",

  refreshEvents: ['model.hull.me.change'],

  templates: ["button"],

  options: {
    listName: 'likes'
  },

  requiredOptions: ['listName'],

  datasources: {
    list: function() {
      return this.api.model("me/lists/" + this.options.listName).fetch();
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
      this.track("list:" + verb, {
        itemId: self.id,
        listName: list.name
      });
      this.render();
    }.bind(this));
  },

  actions: {
    addToList: function() {
      this.toggle('add');
    },
    removeFromList: function() {
      this.toggle('remove');
    }
  }

});
