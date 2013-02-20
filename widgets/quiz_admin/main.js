define({
  type: "Hull",
  templates: ['quiz_admin_form','quiz_admin_header','quiz_admin_details','quiz_admin_question','quiz_admin_choices','quiz_admin_answer','quiz_admin_addquestion','quiz_admin_save'],
  datasources: {
    quiz: ':id'
  },
  initialize: function() {
  },
  beforeRender: function(data) {
    this.quiz = data.quiz;
  },

  afterRender: function() {
    this.tplQuestion = this.renderTemplate('quiz_admin_question');
    this.tplChoice = this.renderTemplate('quiz_admin_answer');
    this.$form = $('#hull-quiz_admin__form');
  },

  submit: function(quiz) {
    //this.data.quiz.save();
    this.api('/hull/'+quiz.id, 'put', quiz, function(){
      this.render('quiz_admin_form');
    }.bind(this));
  },

  actions: {
    addchoice: function(source, e, options) {
      source.prev('table').find('tbody').append(this.tplChoice);
      return false;
    },
    addquestion: function(source, e, options) {
      source.parent('li').before(this.tplQuestion);
      return false;
    },
    deletequestion: function(source,e,options) {
      source.parents('li').remove();
      return false;
    },
    deletechoice: function(source,e,options) {
      source.parents('tr').remove();
      return false;
    },
    submit: function(source,e,options) {
      var quiz = _.clone(this.quiz),
          extra = {};

      quiz.name = this.$form.find('[name="name"]').val();
      quiz.description = this.$form.find('[name="description"]').val();
      quiz.questions = [];

      // each questions
      this.$form.find('.hull-form__fields__item').each(function(key,item){
        var question = {},
            $item = $(item);

        if($item.attr('data-hull-question-id'))
          question.id = $item.attr('data-hull-question-id') || null;
        question.name = $item.find('[name="detail-name"]').val();
        question.description = $item.find('[name="detail-description"]').val();
        question.answers = [];

        // each answers
        $item.find('tbody tr').each(function(key,tr){
          var answer = {},
              $tr = $(tr);

          if($tr.attr('data-hull-answer-id'))
            answer.id = $tr.attr('data-hull-answer-id');
          answer.name = $tr.find('[name="answer-name"]').val();
          answer.description = $tr.find('[name="answer-description"]').val();
          answer.weight = $tr.find('[name="answer-weight"]').val();

          question.answers.push(answer);
        });

        quiz.questions.push(question);
      });

      this.submit(quiz);
      return false;
    }
  }

});
