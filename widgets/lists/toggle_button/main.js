/**
 *
 * Allow users to add and remove objects from lists.
 * Lists are created on the fly, with the `list-name` you specify.
 *
 * ## Examples
 *
 *     <div data-hull-widget="list_toggle@hull" data-hull-id="app" data-hull-list-name="favorites"></div>
 *     <div data-hull-widget="list_toggle@hull" data-hull-id="HULL_ID" data-hull-list-name="favorites"></div>
 *     <div data-hull-widget="list_toggle@hull" data-hull-uid="ANY_UNIQUE_ID" data-hull-list-name="favorites"></div>
 *
 * ## Options
 *
 * - `list-name`: The name of the list you want to show. List will automatically be created if it does not exist yet.
 * - `id` : The ID of the object you want to add / remove to the list.
 * - `uid` : Alternatively, any external UID you want to add to the list. Object will be created as an external Entity
 *
 * ## Template
 *
 * - `list_toggle`: Shows the button with the right state
 *
 */
define({
  type: "Hull",

  refreshEvents: ['model.hull.me.change'],

  templates: ["list_toggle"],

  options: {
    listName: 'likes'
  },

  initialize: function() {

  },

  datasources:{
    // list: "me/lists/:listName"
    list: function() {
      if (this.loggedIn()) {
        this.list = this.api.model("me/lists/"+this.options.listName);
        return this.list.deferred;
      }
    },
    obj: ":id"
  },

  beforeRender: function(data) {
    this.id = data.obj.id;
    if (data.list && data.list.items) {
      var itemIds   = _.pluck(data.list.items, "id");
      data.isListed = _.include(itemIds, this.id);
      data.objName = data.obj.name || data.obj.uid;
      data.listName = data.list.name;
      this.itemPath = data.list.id + "/items/" + data.obj.id;
    }
    return data;
  },

  toggle: function(verb) {
    var list = this.list;
    var method = verb === 'remove' ? 'delete' : 'post';
    this.api(this.itemPath, method).then(function() {
      list.fetch().then(function() {
        var itemId  = this.id;
        var item    = _.filter(list.items, function(i) { return i.id === itemId })[0];
        this.track("list:" + verb, {
          itemId: this.id,
          listName: list.get("name")
        });
        this.render();
      }.bind(this));
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
