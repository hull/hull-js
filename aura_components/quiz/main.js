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
 * @template {intro}    Show the title and the description of the quiz. And secondarily the identity component if the user is not connected..
 * @template {question} Show a question and its answers.
 * @template {answer}   A partial template used in the `quiz_question` template. It shows the name and the description of the answer.
 * @template {finished} Say to the user that the quiz is finish.
 * @template {result}   Show to the user his score.
 * @datasource {quiz} A collection of all the questions and their possible answers.
 * @example <div data-hull-component="quiz@hull"  data-hull-id="QUIZ_ID"></div>
 */

Hull.define({
  type: "Hull",

  trackingData: function() {
    var data = { type: 'quiz' };
    var quiz = this.data.quiz;
    if (quiz && quiz.get) { data.name = quiz.get('name'); }
    return data;
  },

  templates: [
    'intro',
    'question',
    'answer',
    'finished',
    'result'
  ],

  answers: {},

  datasources: {
    quiz: ':id'
  },

  initialize: function() {
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
    this.render('question');
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
      return "intro";
    } else if (this.submitted && data.result) {
      return "result";
    } else if (data.current) {
      if (data.current.question) {
        return "question";
      } else {
        return "finished";
      }
    } else if (data.result) {
      return "result";
    }
    return "intro";
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

    login: function(e, params) {
      this.sandbox.login(params.data.provider, params.data).then(this.startQuiz.bind(this));
    },

    answer: function(e, params) {
      var opts = params.data;
      this.answers[opts.questionId] = opts.answerId;
      this.data.quiz.set('answers', this.answers);

      this.track('progress', {
        questionId: opts.questionId,
        answerId: opts.answerId,
        questionIndex: this.currentQuestionIndex,
        questionsCount: this.data.quiz.get('questions').length
      });
    },

    answerAndNext: function() {
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
      return false;
    },

    previous: function() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex -= 1;
        this.render('question');
      }
      return false;
    },

    submit: function() {
      this.track("submit");
      var timing = 0;
      if (this.startedAt) {
        timing  = (new Date() - this.startedAt) / 1000;
      }

      var res  = this.api(this.id + "/achieve", 'post', {
        answers: this.answers,
        timing: timing
      });

      var self = this;
      res.done(function(badge) {
        if (badge) {
          self.submitted = true;
          self.data.quiz.set('badge', badge);
          self.render('result');
          self.track('finish', { score: badge.data.score, timing: badge.data.timing });
        } else {
          console.warn("Bah alors ? mon badge ?", badge);
        }
      });
      return false;
    },

    share: function (e, params) {
      var data = params.data;
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
