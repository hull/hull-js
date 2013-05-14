/**
 * Show the number of comments on an object of the current application.
 *
 * ## Example
 *
 *     <div data-hull-widget="comments_count@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
 *
 * - `id`: Required, The object you want to manipulate comments upon.
 *
 * ## Template:
 *
 * - `comments_count`: Display a simple counter
 *
 * ## Datasource:
 *
 * - `comments`: Collection of all the comments made on the object.
 *
 */

/*global define:true, _:true */
define({
  type: 'Hull',

  templates: ['comments_count'],

  datasources: {
    comments: ":id"
  },

  beforeRender: function(data){
    data.count = data.comments.stats.comments || 0;
  }

});
