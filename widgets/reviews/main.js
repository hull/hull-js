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
      return this.api("hull/" + this.id + "/reviews");
    }
  },

  actions: {
    review: function(elt, evt) {
      var description = this.$el.find("textarea").val(),
          rating = this.$el.find("select").val(),
          self = this;
      if (rating) {
        this.api('hull/' + this.id + '/reviews', 'post', {
          rating: rating,
          description: description
        }).then(function() { self.render() });
      }
      evt.stopPropagation();
    }
  }
});

