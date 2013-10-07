/**
 *
 * Create and edit quizzes.
 *
 * @name Quiz
 * @template {admin} The main template. It shows the list of your quizzes or the form to edit a quiz.
 * @template {list}  Show the list of your quizzes and a form to add new quizzes.
 * @template {form}  Show the form to edit a quiz.
 * @datasource {quizzes} The collection of all the quizzes available in the application.
 * @example <div data-hull-component="admin/quiz@hull"></div>
 */
Hull.component({
  templates : [ 'admin', 'form' ],

  datasources : {
    achievements : 'app/achievements'
  },

  events: {
    'submit form': 'submitQuiz'
  },

  actions : {
    selectQuiz : function(event, action) {
      var self = this,
          quizId = action.data.quizId,
          quiz = this.data.achievements.get(quizId);

      if (this.currentQuiz) {
        this.stopListening(this.currentQuiz);
      }

      if (quiz) {
        this.options.quizId = quiz.id;
        this.currentQuiz = quiz;
        quiz.url = quiz.id;
        this.listenTo(this.currentQuiz, 'change', function() {
          self.render();
        });

        this.render();
      }
    },

    addQuestion: function() {
      this.changeForm();

      var questions = this.currentQuiz.get('questions') || [];
      questions.push(this.generateQuestion());
      this.currentQuiz.set('questions', questions);

      this.currentQuiz.trigger('change');
    },

    addAnswer: function(event, action) {
      this.changeForm();

      var question = this.currentQuiz.get('questions')[action.data.questionIndex];
      question.answers = question.answers || [];
      question.answers.push(this.generateAnswer(action.data.questionIndex));

      this.currentQuiz.trigger('change');
    },

    deleteQuestion: function(event, action) {
      var questions = this.sandbox.util._.reject(this.currentQuiz.get('questions'), function(q, i) {
        return i == action.data.questionIndex;
      });

      this.currentQuiz.set('questions', questions);
    }
  },

  changeForm: function() {
    var params = this.sandbox.dom.getFormData(this.$form);
    this.currentQuiz.set(params);

    return params;
  },

  submitQuiz: function(e) {
    e.preventDefault();

    var params = this.changeForm();

    this.api(this.currentQuiz.id, params, 'put').then(this.sandbox.util._.bind(function() {
      this.render();
    }, this));
  },

  beforeRender : function(data) {
    var _ = this.sandbox.util._;

    data.quizzes = _.filter(data.achievements, function(a) {
      return a.type === 'quiz';
    });

    if (this.currentQuiz){
      data.quiz = this.currentQuiz.toJSON();
      _.each(data.quiz.questions, function(q, i) {
        _.each(q.answers, function(a) { a.questionIndex = i; });
      });
    }
  },

  afterRender : function() {
    if (this.options.quizId) {
      this.$find('[data-hull-quiz-id="' + this.options.quizId + '"]').addClass('active');
    }

    this.$form = this.$('.js-hull-quiz-form');
  },

  generateQuestion: function() {
    return { answers: [] };
  },

  generateAnswer: function(index) {
    return { questionIndex: index };
  }
});
