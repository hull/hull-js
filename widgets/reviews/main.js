/**
 * Widget Reviews
 *
 * Not ready yet
 */
define({
  type: "Hull",

  templates: ['reviews'],

  datasources: {
    reviews: function() {
      var id = this.getId();
      if (id) {
        this.path = id + "/reviews";
        return this.api(id + "/reviews");
      }
    }
  },

  actions: {
    review: function(evt) {
      var description = this.$el.find("textarea").val(),
          rating = this.$el.find("select").val(),
          self = this;
      if (rating) {
        this.api(this.path, 'post', {
          rating: rating,
          description: description
        }).then(function() { self.render() });
      }
      evt.stopPropagation();
    }
  }
});

