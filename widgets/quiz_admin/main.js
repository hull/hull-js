define({
  type: "Hull",
  templates: ['form'],
  initialize: function() {

  },

  afterRender: function() {
    this.tplQuestion = $('#quiz_admin_question').html();
    this.tplChoice = $('#quiz_admin_choice').html();
  },

  actions: {
    addchoice: function(source, e, options) {
      source.parent('li').before(this.tplChoice);
      return false;
    },
    addquestion: function(source, e, options) {
      source.parent('li').before(this.tplQuestion);
      return false;
    },
    deleteitem: function(source,e,options) {
      source.parent('li').remove();
      return false;
    }
  }

});
