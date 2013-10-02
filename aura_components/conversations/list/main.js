/**
 * List all conversations within the current app
 *
 * @name List
 * @param {String} visibility Optional Visibility level (public/private/all)
 * @param {String} id/uid     Optional Display list of conversations on this specific id/uid
 * @datasource {conversations} List of conversations
 * @example <div data-hull-component="conversations/list@hull"></div>
 */

/*global define:true */
Hull.component({
  type: 'Hull',

  templates: ['list'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    select: "select",
  },

  options: {
    focus: false
  },

  datasources: {
    conversations: function () {
      var url = this.options.id ? this.options.id : '';
      url += '/conversations';
      return this.api(url, {visibility: this.options.visibility || undefined});
    }
  },

  initialize: function() {
    this.sandbox.on('hull.conversations.*', function(id) {
      this.options.id = id;
      this.render();
      this.highlight(id);
    }, this);

    this.sandbox.on('hull.conversation.thread.delete', function() {
     this.render();
     this.sandbox.emit('hull.conversation.select', null);
    }, this);
  },
  
  beforeRender: function(data, errors){
    data.errors = errors;
    return data;
  },
  
  highlight: function(id){
    var selected = this.$el.find('[data-hull-id="'+id+'"]');
    this.$el.find('[data-hull-action="select"]').not(selected).removeClass('selected')
    selected.addClass('selected');
  },

  select: function(e, action) {
    this.highlight(action.data.id);
    this.sandbox.emit('hull.conversation.select', action.data.id);
  }
});
