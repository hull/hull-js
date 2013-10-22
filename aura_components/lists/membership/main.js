/**
 * Shows and Manages the lists an object belongs to.
 *
 * @name Membership
 * @param {String} id/uid Required, The object you want to comment on.
 * @template {main} Displays the basic markup information necessary to display the popover containg the list of lists
 * @template {elements} Displays the form to create a new list and all the lists that belong to the current user
 * @datasource {lists}    Collection of all the lists the user has access to
 * @datasource {listedIn} Collection of lists in which the current item is listed into
 * @requires {jQuery.fn.popover} The popover plugin available in Twitter Bootstrap
 * @action {toggle} Toggles the presence of the current item in the selected list
 * @example <div data-hull-component="lists/membership@hull" data-hull-uid="http://path.to/my/url"></div>
 * @example <div data-hull-component="lists/membership@hull" data-hull-id="HULL_OBJECT_ID"></div>
 */

/*jshint jquery:true */
/*global Hull:true */
Hull.component({
  type: 'Hull',
  templates: ['main', 'items', 'loggedOut', 'header'],
  refreshEvents: ['model.hull.me.change'],
  requiredOptions: ['id'],

  datasources: {
    /*
     * Retrieves all the lists the current user has access to
     */
    lists: function () {
      "use strict";
      var _ = this.sandbox.util._;
      return !this.loggedIn() && [] || this.api('me/lists').then(function(data) {
        return _.map(data, function (list) {
          return {id: list.id, name: list.name};
        });
      });
    },
    /*
     * Retrieves the lists in which the current item belongs to
     */
    listedIn: function () {
      "use strict";
      var _ = this.sandbox.util._;
      return !this.loggedIn() && true || this.api(this.options.id + '/listed_in').then(function(data) {
        return _.pluck(data, 'id');
      });
    }
  },

  initialize: function () {
    "use strict";
    if (!this.sandbox.util._.isFunction(this.$el.popover)) {
      throw new Error('The component ' + this.componentName + ' requires jQuery.popover.');
    }
  },

  /*
   * Creates the popover in which the user will perform the actions
   */
  afterRender: function () {
    "use strict";
    var _ = this.sandbox.util._;
    var btn = this.$el.find('[data-hull-toggle]');
    btn.popover({
      title: 'Add to List',
      html: true,
      placement: 'bottom',
      content: '',
      container: 'body'
    });
    btn.on('show', this.sandbox.util._.bind(this.renderPopover, this));
    this.sandbox.dom.find(document.body).on('click', _.bind(function (evt) {
      if (this.getContentTip().find(evt.target).length === 0 && btn.index(evt.target) === -1) {
        btn.popover('hide');
      }
    }, this));
  },
  /*
   * Creates a new list for the user
   */
  'createList': function (listData) {
    "use strict";
    var _ = this.sandbox.util._;
    this.api.post('me/lists', listData).then(_.bind(function (list) {
      this.data.lists.unshift({id: list.id, name: list.name});
      this.addToList(list.id).then(_.bind(this.refreshElements, this));
      this.getContentTip().find('input').val('');
    }, this));
  },
  /*
   * Indicates if the current item belongs to a list or not.
   */
  isItemInList: function (listId) {
    "use strict";
    return this.data.listedIn.indexOf(listId) > -1;
  },
  /*
   * Removes the current item from the list which id is passed in parameter
   */
  removeFromList: function (listId) {
    "use strict";
    var _ = this.sandbox.util._;
    return this.toggleIn(listId, 'del').then(_.bind(function () {
      this.data.listedIn = _.filter(this.data.listedIn, function (_listId) {
        return listId !== _listId;
      });
    }, this));
  },
  /*
   * ASdds the current item to the list which id is passed in parameter
   */
  addToList: function (listId) {
    "use strict";
    var _ = this.sandbox.util._;
    return this.toggleIn(listId, 'add').then(_.bind(function () {
      this.data.listedIn.unshift(listId);
      this.data.listedIn = _.uniq(this.data.listedIn);
    }, this));
  },
  /*
   * Generic API call to add/remove the current item to/from a list
   */
  toggleIn: function (listId, action) {
    "use strict";
    var methods = {
      add: 'post',
      del: 'delete'
    };
    return this.api(listId + '/items/' + this.options.id, methods[action]);
  },
  /*
   * Renders the partial for all the lists, with the correct data
   */
  renderPopover: function () {
    "use strict";
    var tip = this.getContentTip();
    var $popoverContent = tip.find('.popover-content');
    if (!this.loggedIn()) {
      $popoverContent.html(this.renderTemplate('loggedOut'));
    } else {
      var contents = this.renderTemplate('header', {
        id: this.id
      });
      $popoverContent.html(contents);
      this.refreshElements();
    }
    this.sandbox.start($popoverContent, { reset: true  });

    var self = this;
    tip.on('click', '.lists a', function (evt, ctx) {
      evt.preventDefault();
      var _ = self.sandbox.util._;
      var listId = self.sandbox.dom.find(evt.currentTarget).data('hull-list-id');
      var method = self.isItemInList(listId) ? 'removeFromList' : 'addToList';
      var promise = self[method](listId);
      promise.then(_.bind(self.refreshElements, self));
    });
    tip.on('submit', 'form', function (evt) {
      evt.preventDefault();
      var formData = self.sandbox.dom.getFormData(evt.currentTarget);
      return self.createList(formData);
    });
  },
  /*
   * Renders the lists in the popover
   */
  refreshElements: function () {
    "use strict";
    var content = this.getContentTip();
    var $elts = content.find('.popover-content .lists');
    var _ = this.sandbox.util._;
    this.$find('input[type=text][name=name]').val('');
    _.each(this.data.lists, _.bind(function (list) {
      list.cssClass = this.isItemInList(list.id) ? '' : 'hidden';
    }, this));
    $elts.html(this.renderTemplate('items', {
      elements: this.data.lists
    }));
  },
  getContentTip: function () {
    return this.$el.find('[data-hull-toggle]').data('popover').tip();
  }
});
