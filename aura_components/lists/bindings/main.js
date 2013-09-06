/**
 * ## Manages the lists in which an item belongs to
 *
 * Allows to link/unlink an item to any list, and create some lists also.
 *
 * ### Example
 *
 *     <div data-hull-component="lists/bindings@hull" data-hull-id="HULL_OBJECT_ID"></div>
 *
 * or if you want to reference any other Entity (for example the url of the current page)
 *
 *     <div data-hull-component="lists/bindings@hull" data-hull-uid="http://path.to/my/url"></div>
 *
 * ### Option:
 *
 * - `id` or `uid`: Required, The object you want to comment on.
 *
 * ### Template:
 *
 * - `main`: Displays the basic markup information necessary to display the popover containng the list of lists
 * _ `elements`: Displays the form to create a new list and all the lists that belong to the current user
 *
 * ### Datasource:
 *
 * - `lists`: Collection of all the lists the user has access to
 * _ `listedIn`: Collection of lists in which the current item is listed into
 *
 * ### Action:
 *
 * - `toggleListed`: Toggles the presence of the current item in the selected list
 */


/*jshint jquery:true */
/*global Hull:true */
Hull.define({
  type: 'Hull',
  templates: ['main', 'elements'],
  refreshEvents: ['model.hull.me.change'],
  requiredOptions: ['id'],

  datasources: {
    /*
     * Retrieves all the lists the current user has access to
     */
    lists: function () {
      "use strict";
      var _ = this.sandbox.util._;
      return !this.loggedIn() && true || this.api('me/lists').then(function(data) {
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
  events: {
    /*
     * Retrieves the data from the form in the popup when it is submitted.
     * Calls the method to create a new list for the user
     */
    "submit .new form": function (evt) {
      "use strict";
      evt.preventDefault();
      var formData = this.sandbox.dom.getFormData(evt.currentTarget);
      return this.createList(formData);
    }
  },
  actions: {
    /*
     * Inserts or Removes the current item from the selected list
     */
    'toggleListed': function (evt, ctx) {
      "use strict";
      var _ = this.sandbox.util._;
      var listId = ctx.data.listId;
      var method = this.isItemInList(listId) ? 'removeFromList' : 'addToList';
      var promise = this[method](listId);
      promise.then(_.bind(this.updateView, this));
    }
  },
  /*
   * Creates the popover in which the user will perform the actions
   */
  afterRender: function () {
    "use strict";
    var btn = this.$el.find('.btn-mini');
    var self = this;
    btn.popover({
      title: 'Add to List',
      html: true,
      placement: 'bottom',
      content: function () {
        return self.$find('.hidden').html();
      }
    });
    this.updateView();
  },
  /*
   * Creates a new list for the user
   */
  'createList': function (listData) {
    "use strict";
    var _ = this.sandbox.util._;
    this.api.post('me/lists', listData).then(_.bind(function (list) {
      this.data.lists.unshift({id: list.id, name: list.name});
      this.updateView();
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
    return this.toggleListedIn(listId, 'del').then(_.bind(function () {
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
    return this.toggleListedIn(listId, 'add').then(_.bind(function () {
      this.data.listedIn.unshift(listId);
      this.data.listedIn = _.uniq(this.data.listedIn);
    }, this));
  },
  /*
   * Generic API call to add/remove the current item to/from a list
   */
  toggleListedIn: function (listId, action) {
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
  updateView: function () {
    "use strict";
    var _ = this.sandbox.util._;
    var self = this;
    this.$find('input[type=text][name=name]').val('');
    _.each(this.data.lists, function (list) {
      list.cssClass = self.isItemInList(list.id) ? '' : 'hidden';
    });
    this.$el.find('ul.lists').html(this.renderTemplate('elements', {
      elements: this.data.lists
    }));
  }
});
