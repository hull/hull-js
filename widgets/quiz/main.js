/**
 * # Quiz
 *
 * A quiz is a game in which the player attempts to find the answer to questions from multiple possible answers.
 *
 * To create a quiz, use the `quiz_admin` widget in an admin page, which will let you create a new Quiz (which is a particular type of achievement).
 *
 * Then use this quiz's ID as a parameter for your widget.
 *
 * ## Parameters
 *
 * - `id`: The id of the quiz you want to display
 *
 * ## Templates
 *
 * - `quiz_intro`: Show the title and the description of the quiz. And secondarily the identity widget if the user is not connected..
 * - `quiz_question`: Show a question and its answers.
 * - `quiz_answer`: A partial template used in the `quiz_question` template. It shows the name and the description of the answer.
 * - `quiz_finished`: Say to the user that the quiz is finish.
 * - `quiz_result`: Show to the user his score.
 *
 * ## Datasources
 *
 * - `quiz`: A collection of all the questions and their possible answers.
 *
 * ## Actions
 *
 * - `login`: Triggered when the user logs in and call the `startQuiz` method.
 * - `submit`: Triggered when the user click on the submit button and push his score to the api.
 *
 */
define({
  type: "Hull",

  trackingData: function() {
    return { name: this.data.quiz.get('name') };
  },

  templates: [
    'quiz_intro',
    'quiz_question',
    'quiz_answer',
    'quiz_finished',
    'quiz_result'
  ],

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
  },

  beforeRender: function(data) {
    if (!this.isInitialized) { this.track('init'); }

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
  },


  actions: {

    login: function(source, e, options) {
      this.sandbox.login(options.provider, options).then(this.startQuiz.bind(this));
    },

    answer: function(source, e, opts) {
      this.answers[opts.questionId] = opts.answerId;
      this.quiz.set('answers', this.answers);

      this.track('progress', {
        questionId: opts.questionId,
        answerId: opts.answerId,
        questionIndex: this.currentQuestionIndex,
        questionsCount: this.data.quiz.get('questions').length
      });
    },

    answerAndNext: function(source, e, opts) {
      this.actions.answer.apply(this, arguments);
      this.actions.next.apply(this);
    },

    start: function() {
      this.track("start");
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
      this.track("submit");
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
          self.track('finish', { score: badge.data.score, timing: badge.data.timing });
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
  }

});
