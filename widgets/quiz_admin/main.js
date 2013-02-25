/**
 * # Quiz Admin
 *
 * This widget allow you to edit and add quizzes in your application.
 *
 * ## Templates
 *
 * - `quiz_admin`: The main template. It shows the list of your quizzes or the form to edit a quiz.
 * - `quiz_admin_list'`: Show the list of your quizzes and a form to add new quizzes.
 * - `quiz_admin_form'`: Show the form to edit a quiz.
 * - `quiz_admin_form_header'`: A partial template used in the `quiz_admin_form` template. It shows the name, the description and a snippet of code to show how to instanciate the quiz.
 * - `quiz_admin_form_question'`: A partial template used in the `quiz_admin_form` template. It shows a question, its answers and some actions you can execute on the current question.
 * - `quiz_admin_form_details'`: A partial template used in the `quiz_admin_form_question` template. It shows the name and the description of the current question.
 * - `quiz_admin_form_choices'`: A partial template used in the `quiz_admin_form_question` template. It shows a table of answers displayed by the current question.
 * - `quiz_admin_form_answer`: A partial template used in the `quiz_admin_form_choices` template. It's a row of the answers table which shows the name and the description of the current answer.
 *
 * ## Datasources
 *
 * - `quiz`: The collection of all the quizzes available in the application.
 *
 */
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

  templates: [
    'quiz_admin',
    'quiz_admin_list',
    'quiz_admin_form',
    'quiz_admin_form_header',
    'quiz_admin_form_question',
    'quiz_admin_form_details',
    'quiz_admin_form_choices',
    'quiz_admin_form_answer'
  ],

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
    this.api('/hull/'+quiz.id, 'put', quiz, function(){
      this.quiz = null;
      this.render();
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
      var name = $('#hull-quiz-name').val();
      this.api('/hull/app/achievements', 'post', {name: name, type: 'quiz'}, function(data){
        this.quiz = data;
        this.render();
      }.bind(this));
      return false;
    },

    import: function(source, e, options) {
      e.preventDefault();
      var val = $('#hull-quiz-json').val();
      try {
        var json = jQuery.parseJSON(val);
        this.api('/hull/app/achievements', 'post', json, function(data){
          this.quiz = data;
          this.render();
        }.bind(this));
      } catch(e) {
         alert('invalid json');
      }
    },

    delete: function(source, e, options) {
      if(window.confirm("Are you sure you want to delete this quiz?")) {
        this.api('/hull/'+this.quiz.id, 'delete', {}, function(){
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
      source.parents('.hull-form__fields__item').find('tbody').append(this.tplChoice);
      return false;
    },

    addquestion: function(source, e, options) {
      source.parent('li').before(this.tplQuestion);
      return false;
    },

    deletequestion: function(source,e,options) {
      if(window.confirm("Are you sure you want to delete this question?")) {
        source.parents('li').remove();
        if(options.question_id){
          this.api('/hull/'+options.question_id, 'delete');
        }
      }
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
