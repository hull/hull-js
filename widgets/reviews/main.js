define(['sandbox'], function(sandbox) {

  var ReviewsCollection = sandbox.mvc.Collection({
    comparator: function(c) {
      return -1 * new Date(c.get('updated_at')).getTime();
    }
  });

  return sandbox.widgets.create({
    namespace: 'reviews',
    templates: ['reviews'],

    initialize: function(options) {
      var self = this,
          reviews = this.reviews = new ReviewsCollection([]);
      reviews.url = this.id + "/reviews";

      this.datasources.reviewable = function() {
        return self.sandbox.data.api("hull/" + self.id, { fields: 'reviews' });
      }
    },

    beforeRender: function(data) {
      data.reviews = this.reviews.reset(data.reviewable.reviews).toJSON();
      return data;
    },

    afterRender: function() {
      var area = this.dom.find('textarea', this.$el);
      area.focus();
    },

    actions: {
      review: function() {
        var description = this.dom.find("textarea", this.$el).val(),
            rating = this.dom.find("select", this.$el).val(),
            self = this;

        this.data.api.post("hull", this.id + "/reviews", { description: description, rating: rating }).done(function() {
          self.render();
        });
      }
    }
  });

});

