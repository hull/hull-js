/**
 * ##Lists/contents
 *
 * This component displays the items contained in a list owned by the current user
 *
 * ### Options
 *
 * `list-name`: The name of the list which items you want to display
 *
 * ### Templates
 *
 * * `main`: A wrapper around the itsms of the list to display
 * * `list`: How to display an item of a list
 *
 * ### Datasources
 *
 * `listContents`: The contents of the list
 *
 */

/*global Hull:true */
Hull.define({
  type: 'Hull',
  templates: ['main', 'element'],
  datasources: {
    listContents: 'me/lists/:listName'
  },
  requiredOptions: ['listName'],
  refreshEvents: ['model.hull.me.change'],
  beforeRender: function (data) {
    "use strict";
    var listContents = data.listContents || {};
    data.items = listContents.items;
  }
});
