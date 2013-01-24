define({
    type: "Hull",
    namespace: "quiz",
    templates: [ "quiz_intro", "quiz_question", "quiz_finished", "quiz_result" ],
    answers: {},
    initialize: function() {
        this.quiz = this.api.model(this.id);
        this.sandbox.on("hull.model." + this.id + ".change", function() {
            this.render();
        }.bind(this));
        this.datasources.quiz = this.id;
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
            this.quiz.set("answers", this.answers);
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
                this.render("quiz_question");
            }
        },
        submit: function() {
            var timing = 0;
            if (this.startedAt) {
                timing = (new Date() - this.startedAt) / 1e3;
            }
            var res = this.api.post("hull", this.id + "/achieve", {
                data: {
                    answers: this.answers
                },
                timing: timing
            });
            var self = this;
            res.done(function(badge) {
                self.submitted = true;
                self.quiz.set("badge", badge);
            });
        }
    },
    startQuiz: function() {
        this.reset();
        this.startedAt = new Date();
        this.started = true;
        this.render("quiz_question");
    },
    reset: function() {
        this.started = false;
        this.submitted = false;
        this.answers = {};
        this.currentQuestionIndex = 0;
        this.currentUserId = this.api.model("me").id;
    },
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
        data.result = this.getResult(data);
        if (this.started) {
            data.questions = this.getQuestions(data);
            data.current = this.getCurrent(data);
        }
        return data;
    },
    getCurrent: function(data) {
        this.currentQuestion = data.questions[this.currentQuestionIndex];
        return {
            index: this.currentQuestionIndex,
            question: this.currentQuestion,
            next: data.questions[this.currentQuestionIndex + 1],
            previous: data.questions[this.currentQuestionIndex - 1]
        };
    },
    getQuestions: function(data) {
        return data.quiz.questions;
    },
    getResult: function(data) {
        return data.quiz.badge;
    }
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["quiz/quiz_finished"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    return "Yeah, you have finished the super quiz !\n\n<button data-hull-action='submit'>Submit !</button>\n";
});

this["Hull"]["templates"]["_default"]["quiz/quiz_intro"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, self = this;
    function program1(depth0, data) {
        return "\n<button data-hull-action='start'>Start !</button>\n";
    }
    function program3(depth0, data) {
        return "\n<button data-hull-action='login' data-hull-provider=\"facebook\">Login first... !</button>\n";
    }
    buffer += "<h1>Hey, a super intro !</h1>\n\n";
    stack1 = depth0.loggedIn;
    stack2 = {};
    stack1 = helpers["if"].call(depth0, stack1, {
        hash: stack2,
        inverse: self.program(3, program3, data),
        fn: self.program(1, program1, data),
        data: data
    });
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n";
    return buffer;
});

this["Hull"]["templates"]["_default"]["quiz/quiz_question"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, foundHelper, functionType = "function", escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing;
    function program1(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += "\n<h1>";
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</h1>\n<p>";
        foundHelper = helpers.description;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.description;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</p>\n";
        return buffer;
    }
    function program3(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += "\n";
        foundHelper = helpers.question;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.program(4, program4, data),
                data: data
            });
        } else {
            stack1 = depth0.question;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.question) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.program(4, program4, data),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n\n<div>\n";
        stack1 = depth0.previous;
        stack2 = {};
        stack1 = helpers["if"].call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(7, program7, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n\nCurrent: ";
        foundHelper = helpers.index;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.index;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "\n\n";
        stack1 = depth0.next;
        stack2 = {};
        stack1 = helpers["if"].call(depth0, stack1, {
            hash: stack2,
            inverse: self.program(11, program11, data),
            fn: self.program(9, program9, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n</div>\n\n";
        return buffer;
    }
    function program4(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += "\n<div>\n  <h3>";
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</h3>\n  <p>";
        foundHelper = helpers.description;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.description;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</p>\n  <div>\n    ";
        foundHelper = helpers.answers;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.programWithDepth(program5, data, depth0),
                data: data
            });
        } else {
            stack1 = depth0.answers;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.answers) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.programWithDepth(program5, data, depth0),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n  </div>\n</div>\n";
        return buffer;
    }
    function program5(depth0, data, depth1) {
        var buffer = "", stack1, foundHelper;
        buffer += '\n    <button data-hull-action="answerAndNext"\n            data-hull-answer-id="';
        foundHelper = helpers.id;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.id;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n            data-hull-question-id="';
        stack1 = depth1.id;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        buffer += escapeExpression(stack1) + '"\n    >';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</button>\n    ";
        return buffer;
    }
    function program7(depth0, data) {
        return '\n<button data-hull-action="previous">&larr; Previous</button>\n';
    }
    function program9(depth0, data) {
        return '\n<button data-hull-action="next">Next &rarr;</button>\n';
    }
    function program11(depth0, data) {
        return '\n<button data-hull-action="submit">Submit</button>\n';
    }
    foundHelper = helpers.quiz;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
    } else {
        stack1 = depth0.quiz;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.quiz) {
        stack1 = blockHelperMissing.call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
    }
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n";
    foundHelper = helpers.current;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.noop,
            fn: self.program(3, program3, data),
            data: data
        });
    } else {
        stack1 = depth0.current;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.current) {
        stack1 = blockHelperMissing.call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(3, program3, data),
            data: data
        });
    }
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n";
    return buffer;
});

this["Hull"]["templates"]["_default"]["quiz/quiz_result"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, foundHelper, functionType = "function", escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing;
    function program1(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += "\nYou Have ";
        foundHelper = helpers.score;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.score;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + " points !\n";
        return buffer;
    }
    buffer += "<h1>Yeah... a great result ! ";
    foundHelper = helpers.renderCount;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            data: data
        });
    } else {
        stack1 = depth0.renderCount;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    buffer += escapeExpression(stack1) + "</h1>\n\n";
    stack1 = depth0.result;
    stack1 = stack1 == null || stack1 === false ? stack1 : stack1.data;
    stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    stack2 = {};
    stack1 = blockHelperMissing.call(depth0, stack1, {
        hash: stack2,
        inverse: self.noop,
        fn: self.program(1, program1, data),
        data: data
    });
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += '\n\n\n<button data-hull-action="start">Start over...</button>\n\n';
    return buffer;
});