/**
 *
 * Create and edit quizzes.
 *
 * @name Quiz
 * @tmpl {admin} The main template. It shows the list of your quizzes or the form to edit a quiz.
 * @tmpl {list}  Show the list of your quizzes and a form to add new quizzes.
 * @tmpl {form}  Show the form to edit a quiz.
 * @datasource {quizzes} The collection of all the quizzes available in the application.
 * @example <div data-hull-component="admin/quiz@hull"></div>
 */
Hull.component({
  templates : [ 'admin', 'form' ],
 
  datasources : {
    achievements : {
      path: 'app/achievements',
      params: { where: { _type: 'Quiz'} }
    }
  },
 
  require: ['backbone'],
 
  events: {
    'submit form': 'submitQuiz'
  },
 
  actions : {
    selectQuiz : function(event, action) {
      var Model = this.require('backbone').Model;
 
      var quiz;
      if (action.data.quizId != null) {
        quiz = this.data.achievements.get(action.data.quizId);
      } else {
        quiz = new Model();
      }
 
      if (this.currentQuiz) {
        this.stopListening(this.currentQuiz);
      }
 
      if (quiz) {
        this.currentQuiz = quiz;
 
        var self = this;
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
 
    var self = this, params = this.changeForm();
    var request;
    if (this.currentQuiz.isNew()) {
      params.type = 'quiz';
      request = this.api('app/achievements', params, 'post');
    } else {
      request = this.api(this.currentQuiz.id, params, 'put');
    }
 
    request.then(function() {
      self.render();
      alert('Your quiz has been updated.');
    });
  },
 
  beforeRender : function(data) {
    var _ = this.sandbox.util._;
 
    if (this.currentQuiz){
      data.quiz = this.currentQuiz.toJSON();
      _.each(data.quiz.questions, function(q, i) {
        _.each(q.answers, function(a) { a.questionIndex = i; });
      });
 
      data.quiz.isNew = this.currentQuiz.isNew();
      if (!data.quiz.isNew) {
        data.embedCode = '<div data-hull-component="games/quiz@hull" data-hull-id="' + data.quiz.id +  '"></div>';
      }
    }
  },
 
  afterRender : function(data) {
    if (data.quiz && data.quiz.id) {
      this.$find('[data-hull-quiz-id="' + data.quiz.id + '"]').addClass('active');
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
