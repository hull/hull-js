define({
  type: "Hull",

  templates: ["list_toggle"],

  options: {
    list_name: 'likes'
  },

  initialize: function() {
    this.list = this.api.model("me/lists/" + this.options.list_name);
    this.datasources.list = this.list.deferred;
  },

  beforeRender: function(data) {
    if (data.list && data.list.items) {
      var itemIds   = _.pluck(data.list.items, "id");
      data.isListed = _.include(itemIds, this.id);
    }
    this.itemPath = "hull/" + data.list.id + "/items/" + this.id;
    console.warn()
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
