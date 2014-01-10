/**
 *
 * A complete Quiz engine.
 *
 * A quiz is a game in which the player attempts to find the answer to questions from multiple possible answers.
 * To create a quiz, use the `admin/quiz` component in an admin page, which will let you create a new Quiz (which is a particular type of achievement).
 *
 * Then use this quiz's ID as a parameter for your component.
 *
 * @name Quiz
 * @param {String} id The id of the quiz you want to display
 * @param {String} autoAdvance boolean: Advance to next question on click on an Answer
 * @param {String} autoSubmit boolean: Skip final screen and auto submit quiz
 * @param {String} quizTimer number: Add a global timer to the quiz
 * @param {String} highlightAnswers boolean: Highlight the currently selected answer with an 'active' class
 * @param {String} autoStart boolean: Skip the intro screen
 * @param {String} sampleQuestions number: Choose n random questions among the total available
 * @param {String} questionTimer number: Add a per-question timer to the quiz
 * @template {quiz}    Show the title and the description of the quiz. And secondarily the identity component if the user is not connected..
 * @datasource {quiz} A collection of all the questions and their possible answers.
 * @datasource {badge} The result of the Quiz for the current user.
 * @example <div data-hull-component="games/quiz@hull"  data-hull-id="5130a76ed4384e508f000009"></div>
 */


Hull.component({

  templates: ['quiz'],
  requiredOptions: ['id'],
  refreshEvents: ['model.hull.me.change'],

  datasources: {
    quiz: ':id',
    badge: 'me/badges/:id'
  },

  actions: {

    answerAndNext: function (event, action) {
      this.actions.answer.apply(this, arguments);
      this.actions.next.apply(this);
    },
 
    answer: function (event, action) {
      if(!!this.options.autoAdvance){
        this.actions.next.apply(this);
      } else {
        this.answer(event,action);
      }
    },

    submit: function (event, action) {
      this.finishQuiz();
    },

    next: function () {
      this.selectNextQuestion();
    },

    previous: function () {
      this.selectPreviousQuestion();
    },

    replay: function (event, action) {
      this.resetAnswers = !! action.data.reset;
      this.playing = true;
      if (this.resetAnswers) {
        this.answers = {};
      }
      this.render();
    },

    start: function (event, action) {
      this.resetAnswers = !! action.data.reset;
      if (this.resetAnswers) {
        this.answers = {};
      }
      this.startQuiz();
    }
  },


  answer: function(event, action){
      var qRef = action.data.questionRef,
        aRef = action.data.answerRef;
      this.selectAnswer(qRef, aRef);
  },
  // Rendering

  beforeRender: function (data) {
    if (data.badge && data.badge.id && !this.playing) {
      data.playing = false;
    } else {
      data.playing = true;
      if (this.resetAnswers) {
        this.answers = {};
      } else {
        var answers = {};
        if (data.badge.data) {
          answers = data.badge.data.answers || {};
        }
        this.answers = answers;
      }
      this.questions = data.quiz.questions;
      data.questions = this.getQuestions();
    }
  },

  afterRender: function (data) {
    var self = this;
    _ = this.sandbox.util._;
    if (data.playing) {
      this.$find('[data-hull-action="answer"]')
        .removeClass('active');
      if (this.options.highlightAnswers) {
        _.each(this.answers, function (a, q) {
          self.getAnswerEl(q, a)
            .addClass('active');
        });
      }
      if (this.options.autoStart) {
        this.startQuiz();
      } else {
        this.showSection('intro');
      }
    }
  },

  showSection: function (sectionName) {
    this.$find('[data-hull-section]')
      .addClass('hidden');
    this.$find('[data-hull-section="' + sectionName + '"]')
      .removeClass('hidden');
  },

  // Questions

  getQuestions: function () {
    var _ = this.sandbox.util._;
    var questions = (this.questions || [])
      .slice(0);
    if (this.options.sampleQuestions > 0) {
      questions = _.sample(questions, this.options.sampleQuestions);
    }
    var index = 0;
    return _.map(questions, function (q) {
      index += 1
      return _.extend(q, {
        pagination: {
          index: index,
          total: questions.length
        }
      });
    });
  },

  getCurrentQuestion: function () {
    var questions = this.getQuestions();
    this.currentQuestionIndex = this.currentQuestionIndex || 0;
    return questions[this.currentQuestionIndex];
  },

  getNextQuestion: function () {
    this.currentQuestionIndex += 1;
    return this.getCurrentQuestion();
  },

  getPreviousQuestion: function () {
    this.currentQuestionIndex = Math.max(this.currentQuestionIndex - 1, 0);
    return this.getCurrentQuestion();
  },

  // Quiz Lifecycle

  startQuiz: function () {
    var self = this;
    this.showSection('questions');
    this.currentQuestionIndex = 0;
    var currentQuestion = this.getCurrentQuestion();
    this.startTicker();
    this.selectQuestion(currentQuestion.ref);
    return this;
  },

  finishQuiz: function () {
    var self = this;
    this.stopTicker();
    var $submitBtn = this.$find('[data-hull-action="submit"]');
    $submitBtn.attr('disabled', true);
    var timing = this.timer.finishedAt - this.timer.startedAt;
    this.api(this.id + "/achieve", 'post', {
      answers: this.answers,
      timing: timing
    }, function (badge) {
      $submitBtn.attr('disabled', false);
      self.playing = false;
      self.render();
    });
  },


  // Timers

  startTicker: function () {
    this.ticker = setInterval(this.onTick.bind(this), 1000);
    this.timer = {
      countdowns: {},
      timings: {},
      startedAt: new Date()
    };
    if (this.options.questionTimer > 0) {
      this.timer.countdowns.question = this.options.questionTimer;
    }
    if (this.options.quizTimer > 0) {
      this.timer.countdowns.quiz = this.options.quizTimer;
    }
  },

  stopTicker: function () {
    this.timer.finishedAt = new Date();
    clearInterval(this.ticker);
  },

  onTick: function () {
    if (this.sandbox.stopped) {
      return this.stopTicker();
    }
    var timer = this.timer;

    // Global Timer
    if (this.options.quizTimer) {
      if (timer.countdowns.quiz > 0) {
        timer.countdowns.quiz -= 1;
        this.onQuizTick(timer.countdowns.quiz, this.options.quizTimer);
      } else if (timer.countdowns.quiz === 0) {
        this.finishQuiz();
      }
    }

    // Question Timer
    if (this.options.questionTimer) {
      if (timer.countdowns.question > 0) {
        timer.countdowns.question -= 1;
        this.onQuestionTick(timer.countdowns.question);
      } else if (timer.countdowns.question === 0) {
        this.selectNextQuestion();
      }
    }
  },

  resetQuestionCountdown: function () {
    if (this.options.questionTimer) {
      this.timer.countdowns.question = this.options.questionTimer;
      this.onQuestionTick(this.options.questionTimer);
    }
  },

  onQuestionTick: function (remaining, total) {
    this.$find('[data-hull-question-ticker]')
      .html(remaining);
  },

  onQuizTick: function (remaining, total) {
    this.$find('[data-hull-quiz-ticker]')
      .html(remaining);
  },


  // Navigation

  selectQuestion: function (qRef) {
    var self = this;
    this.$find('[data-hull-question]')
      .addClass('hidden');
    this.getQuestionEl(qRef)
      .removeClass('hidden');
  },

  selectNextQuestion: function () {
    var q = this.getNextQuestion();
    if (q) {
      this.selectQuestion(q.ref);
      this.resetQuestionCountdown();
    } else {
      if (this.options.autoSubmit) {
        this.finishQuiz();
      } else {
        this.showSection('finished');
        this.stopTicker();
      }
    }
  },

  selectPreviousQuestion: function () {
    var q = this.getPreviousQuestion();
    this.selectQuestion(q.ref);
    this.resetQuestionCountdown();
  },

  selectAnswer: function (qRef, aRef) {
    this.getQuestionEl(qRef)
      .find("[data-hull-action='answer']")
      .removeClass('active');
    this.answers[qRef] = aRef;
    this.getAnswerEl(qRef, aRef)
      .addClass('active');
    if (this.options.autoNext) {
      this.selectNextQuestion();
    }
  },

  // DOM getters

  getQuestionEl: function (qRef) {
    return this.$find("[data-hull-question='" + qRef + "']");
  },

  getAnswerEl: function (qRef, aRef) {
    var $q = this.getQuestionEl(qRef);
    return $q.find("[data-hull-action='answer'][data-hull-answer-ref='" + aRef + "']");
  }

});
