/**
 * Show the number of likes on an object of the current application.
 *
 * ## Example
 *
 *     <div data-hull-widget="like_count@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
 *
 * - `id`: Required, The object you want to manipulate comments upon.
 *
 * ## Template:
 *
 * - `like_count`: Display a simple counter
 *
 * ## Datasource:
 *
 * - `like`: Collection of all the comments made on the object.
 *
 */

/*global define:true, _:true */
define({
  type: 'Hull',

  templates: ['like_count'],

  datasources: {
    likes: ":id"
  },

  beforeRender: function(data){
    data.count = data.comments.stats.likes || 0;
  }

});
