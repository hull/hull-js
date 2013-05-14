/**
 * Widget Reviews
 *
 * Not ready yet
 */
define({
  type: "Hull",

  templates: ['reviews'],

  datasources: {
    reviews:  ":id/reviews"
  },

  actions: {
    review: function(evt) {
      var description = this.$el.find("textarea").val(),
          rating = this.$el.find("select").val(),
          self = this;
      if (rating) {
        this.api(this.id + '/reviews', 'post', {
          rating: rating,
          description: description
        }).then(function() { self.render() });
      }
      evt.stopPropagation();
    }
  }
});

