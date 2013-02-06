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
      var itemIds = _.pluck(data.list.items, "id");
      data.isListed = _.include(itemIds, this.id);
    }
    this.itemPath = "hull/" + data.list.id + "/items/" + this.id;
    console.warn()
    return data;
  },

  toggle: function(verb) {
    var list = this.list;

    this.api(this.itemPath, verb).then(function() {
      list.fetch().then(function() {
        this.render();
      }.bind(this));
    }.bind(this));
  },

  actions: {
    addToList: function() {
      this.toggle('post');
    },
    removeFromList: function() {
      this.toggle('delete');
    }
  }

});
