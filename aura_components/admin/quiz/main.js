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

  type: 'Hull',
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
          console.warn("quiz changed ! --- re-rendering...", arguments);
          self.render()
        });
        window.currentQuiz = this.currentQuiz;
        this.render();
      }
    },

    deleteQuestion: function(event, action) {
      var self = this;
      this.api(this.currentQuiz.id + "/questions/" + action.data.id, 'delete', function() {
        self.render();
      });
    },

    addQuestion: function(event) {
      event.preventDefault();
      var questions = this.currentQuiz.get('questions') || [];
      questions.push({ answers: [ {} ] });
      this.currentQuiz.set({ questions: questions });
    },

    addAnswer: function(event, action) {
      event.preventDefault();
      var questions = this.currentQuiz.get('questions') || [];
      questions.push({ answers: [ {} ] });
      this.currentQuiz.set({ questions: questions });
    }

  },

  submitQuiz: function(e) {
    var self = this, _ = this.sandbox.util._;
    e.preventDefault();
    e.stopPropagation();
    $form = $(e.target);
    console.warn("Submit Form: ", $form.serializeArray());
    var attrs = this.sandbox.dom.getFormData($form);
    attrs.id = this.currentQuiz.id;
    console.warn("A=====> ", attrs);
    attrs.questions = _.map(attrs.questions, function(question, quid) {
      question.answers = _.values(question.answers);
      return question;
    });
    console.warn("Submit Quiz with: ", attrs);
    this.currentQuiz.set(attrs);
    // this.api(attrs.id, attrs, 'put', function() {
    //   self.render();
    // });
  },

  beforeRender : function(data) {
    var filter = this.sandbox.util._.filter;
    data.quizzes = filter(data.achievements, function(a) {
      return a.type === 'quiz';
    });
    if (this.currentQuiz){
      data.quiz = this.currentQuiz.toJSON();
    }

  },

  afterRender : function() {
    if (this.options.quizId) {
      this.$find('[data-hull-quiz-id="' + this.options.quizId + '"]').addClass('active');
    }
  }
});


