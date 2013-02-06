define({
  type: "Hull",

  templates: ["list_toggle"],

  options: {
    list_name: 'likes'
  },

  datasources: {
    obj: ":id",
    list: function() {
      if (this.loggedIn()) {
        return this.api("hull/me/lists/" + this.options.list_name);
      }
    }
  },

  beforeRender: function(data) {
    if (data.list && data.list.items) {
      var itemIds = _.pluck(data.list.items, "id");
      data.isListed = _.include(itemIds, data.obj.id);
    }
    this.itemPath = "hull/" + data.list.id + "/items/" + data.obj.id;
    return data;
  },

  actions: {
    addToList: function() {
      this.api(this.itemPath, 'post').then(function() { this.render(); }.bind(this));
    },
    removeFromList: function() {
      this.api(this.itemPath, 'delete').then(function() { this.render(); }.bind(this));
    }
  }

});
