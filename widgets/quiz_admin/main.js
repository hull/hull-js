define({
  type: "Hull",
  refreshEvents: ['model.hull.me.change'],
  datasources: {
    quizzes: function() {
      return this.api('hull/app/achievements', {
        where: {
          _type: 'Quiz'
        }
      });
    }
  },
  templates: ['quiz_admin','quiz_admin_list','quiz_admin_form','quiz_admin_form_header','quiz_admin_form_details','quiz_admin_form_question','quiz_admin_form_choices','quiz_admin_form_answer','quiz_admin_form_addquestion','quiz_admin_form_save','quiz_admin_form_cancel','quiz_admin_form_delete'],

  initialize: function() {

  },

  beforeRender: function(data) {
    data.quiz = this.quiz;
  },

  afterRender: function() {
    if(this.quiz){
      this.tplQuestion = this.renderTemplate('quiz_admin_form_question');
      this.tplChoice = this.renderTemplate('quiz_admin_form_answer');
      this.$form = $('#hull-quiz_admin__form');
    }
  },

  submit: function(quiz) {
    //this.data.quiz.save();
    this.api('/hull/'+quiz.id, 'put', quiz, function(){
      this.render('quiz_admin_form');
    }.bind(this));
  },

  actions: {
    edit: function(source, e, options) {
      this.api('hull/'+options.id, {}, function(data){
        this.quiz = data;
        this.render();
      }.bind(this));
      return false;
    },
    add:  function(source, e, options) {
      var name = this.$el.find('#quiz-name').val();
      console.log(name);
      this.api('/hull/app/achievements', 'post', {name: name, type: 'quiz'}, function(data){
        this.quiz = data;
        this.render();
      }.bind(this));
      return false;
    },
    delete: function(source, e, options) {
      if(window.confirm("Are you sure you want to delete this quiz?")) {
        this.api('/hull/'+this.quiz.id, 'delete', {name: name, type: 'quiz'}, function(){
          this.quiz = null;
          this.render();
        }.bind(this));
      }
      return false;
    },
    cancel: function(source, e, options) {
      this.quiz = null;
      this.render();
      return false;
    },
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
      var quiz = _.clone(this.quiz);

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
