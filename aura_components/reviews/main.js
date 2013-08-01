/**
 * ## Reviews
 *
 * Not ready yet
 */
Hull.define({
  type: "Hull",

  refreshEvents: ['model.hull.me.change'],
  templates: ['reviews'],
  datasources: {
    review: function() { return this.api(this.options.id + "/reviews/me"); },
    reviews: function() { return this.api(this.options.id + "/reviews"); }
  },

  actions: {
    review: function(event, data) {
      var description = this.$el.find("[data-hull-description]").val(),
          rating      = this.$el.find('[data-hull-rating]').val(),
          self        = this;
      if (rating!==undefined) {
        this.api(this.id + '/reviews', 'post', {
          rating: rating,
          description: description
        }).then(function() {
          self.render();
        });
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }
});

