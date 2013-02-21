/**
 * Widget Quiz
 *
 * Not ready yet
 */
define({
  type: "Hull",
  templates: ['quiz_intro', 'quiz_question', 'quiz_finished', 'quiz_result', 'quiz_answer'],
  initialized: false,
  answers: {},
  datasources: {
    quiz: ':id'
  },

  initialize: function() {
    this.quiz = this.api.model(this.id);
    this.sandbox.on('hull.model.' + this.id + '.change', function() {
      this.render();
    }.bind(this));
    this.sandbox.on('model.hull.me.change', function() {
      if(this.loggedIn()) {this.actions.start.apply(this); }
    }.bind(this));
    this.currentQuestionIndex = 0;
    this.answers = {};
    if (this.options.autostart) {
      this.started = true;
    } else {
      this.started = false;
    }
  },

  trackEvent: function(eventName, eventData) {
    eventData = _.extend({ quizId: this.data.quiz.id, quizName: this.data.quiz.get('name') }, (eventData || {}));
    eventName = "quiz." + eventName;
    this.track(eventName, eventData);
  },

  actions: {

    login: function(source, e, options) {
      this.sandbox.login(options.provider, options).then(this.startQuiz.bind(this));
    },

    answer: function(source, e, opts) {
      this.trackEvent("answer");
      this.answers[opts.questionId] = opts.answerId;
      this.quiz.set('answers', this.answers);
    },

    answerAndNext: function(source, e, opts) {
      this.actions.answer.apply(this, arguments);
      this.actions.next.apply(this);
    },

    start: function() {
      this.trackEvent("start");
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
      this.trackEvent("submit");
      var timing = 0;
      if (this.startedAt) {
        timing  = (new Date() - this.startedAt) / 1000;
      }

      var res  = this.api("hull/" + this.id + "/achieve", 'post', {
        answers: this.answers,
        timing: timing
      });

      var self = this;
      res.done(function(badge) {
        if (badge) {
          self.submitted = true;
          self.quiz.set('badge', badge);
          self.render('quiz_result');
          self.trackEvent('result', { score: badge.data.score, timing: badge.data.timing });
        } else {
          console.warn("Bah alors ? mon badge ?", badge);
        }
      });
    },

    share: function (source, e, data) {
      var currentUrl = document.URL, text = data.text;

      switch (data.provider){
        case 'facebook':
          // @TODO :-)
          break;
        case 'twitter':
          window.open('https://twitter.com/share?url='+currentUrl+'&text='+text);
          break;
      }
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
    if (!this.initialized) {
      this.trackEvent("init");
      this.initialized = true;
    }

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

  afterRender: function(data) {
    this.sandbox.emit('hull.quiz.' + this.id, data);
  },

  getCurrent: function(data) {
    this.currentQuestion = data.questions[this.currentQuestionIndex];
    return {
      index:            this.currentQuestionIndex,
      indexDisplayable: this.currentQuestionIndex+1,
      question:         this.currentQuestion,
      next:             data.questions[this.currentQuestionIndex + 1],
      previous:         data.questions[this.currentQuestionIndex - 1]
    };
  },

  getQuestions: function(data) {
    return data.quiz.questions;
  },

  getResult: function(data) {
    return data.quiz.badge;
  }

});
