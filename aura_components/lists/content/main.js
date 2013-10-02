/**
 * Shows the content of a list of the current user
 * 
 * @name Content
 * @param {String} id/uid The id of the owner which lists you want to display
 * @datasource {content} The contents of the list
 * @template {main} A wrapper around the items of the list to display
 * @template {list} How to display an item of a list
 * @example <div data-hull-component="lists/content@hull" data-hull-list="list_name"></div>
 */

/*global Hull:true */
Hull.component({
  type: 'Hull',
  templates: ['content', 'item'],
  datasources: {
    content: 'me/lists/:list'
  },
  requiredOptions: ['list'],
  refreshEvents: ['model.hull.me.change'],
  beforeRender: function (data) {
    "use strict";
    var content = data.content || {};
    data.items = content.items;
  }
});
