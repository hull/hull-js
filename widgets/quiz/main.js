/**
 * Widget Quiz
 *
 * Not ready yet
 */
define({
  type: "Hull",
  namespace: 'quiz',
  templates: ['quiz_intro', 'quiz_question', 'quiz_finished', 'quiz_result'],

  answers: {},
  datasources: {
    quiz: ':id'
  },

  initialize: function() {
    this.quiz = this.api.model(this.id);
    this.sandbox.on('hull.model.' + this.id + '.change', function() { this.render() }.bind(this));
    this.currentQuestionIndex = 0;
    this.answers = {};
    if (this.options.autostart) {
      this.started = true;
    } else {
      this.started = false;
    }
  },

  actions: {

    login: function(source, e, options) {
      this.sandbox.login(options.provider, options).then(this.startQuiz.bind(this));
    },

    answer: function(source, e, opts) {
      this.answers[opts.question_id] = opts.answer_id;
      this.quiz.set('answers', this.answers);
    },

    answerAndNext: function(source, e, opts) {
      this.actions.answer.apply(this, arguments);
      this.actions.next();
    },

    start: function() {
      this.startQuiz();
    },

    next: function() {
      this.currentQuestionIndex += 1;
      this.render();
    },

    previous: function(source, e, data) {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex -= 1;
        this.render('quiz_question');
      }
    },

    submit: function() {
      var timing = 0;
      if (this.startedAt) {
        timing  = (new Date() - this.startedAt) / 1000;
      }

      var res  = this.api.post("hull", this.id + "/achieve", {
        data: { answers: this.answers },
        timing: timing
      });

      var self = this;
      res.done(function(badge) {
        self.submitted = true;
        self.quiz.set('badge', badge);
      });
    }
  },

  startQuiz: function() {
    this.reset();
    this.startedAt = new Date();
    this.started = true;
    this.render('quiz_question');
  },

  reset: function() {
    this.started = false;
    this.submitted = false;
    this.answers = {};
    this.currentQuestionIndex = 0;
    this.currentUserId = this.api.model('me').id;
  },

  // TODO : Refactor this please !!!!
  getTemplate: function(tpl, data) {
    if (tpl) {
      return tpl;
    }
    if (!this.loggedIn()) {
      return "quiz_intro";
    } else if (this.submitted && data.result) {
      return "quiz_result";
    } else if (data.current) {
      if (data.current.question) {
        return "quiz_question";
      } else {
        return "quiz_finished";
      }
    } else if (data.result) {
      return "quiz_result";
    }
    return "quiz_intro";
  },

  beforeRender: function(data) {

    if (data.me.id != this.currentUserId) {
      this.template = "quiz_intro";
      this.reset();
      return data;
    }

    data.result             = this.getResult(data);

    if (this.started) {
      data.questions        = this.getQuestions(data);
      data.current          = this.getCurrent(data);
    }

    return data;
  },

  getCurrent: function(data) {
    this.currentQuestion = data.questions[this.currentQuestionIndex];
    return {
      index:        this.currentQuestionIndex,
      question:     this.currentQuestion,
      next:         data.questions[this.currentQuestionIndex + 1],
      previous:     data.questions[this.currentQuestionIndex - 1]
    };
  },

  getQuestions: function(data) {
    return data.quiz.questions;
  },

  getResult: function(data) {
    return data.quiz.badge;
  }

});
