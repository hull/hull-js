define(function() {

  return {

    type:       'Hull',
    namespace:  'comments',
    templates:  ['comments'],

    initialize: function(options) {
      var self = this;
      this.datasources.commentable = function() {
        return self.sandbox.data.api("hull/" + self.id, { fields: 'comments' });
      }
    },

    afterRender: function(data) {
      console.warn('comments rendered with data: ', data);
    },

    actions: {
      comment: function() {
        var description = this.$el.find("textarea").val();
            render = function() { this.render() };
        this.sandbox.data.api.post("hull", this.id + "/comments", { description: description }, render);
      }
    }
  };
});

