/**
 * Shows the lists of all users who `liked` an object. Likes are not connected to facebook or any other network
 * You can use this as "favorite", "starred", "want"... or of course "like".
 *
 * @name List
 * @param {String} id   Required The id of the object on which you wants likes listed. Default value will be 'me'
 * @datasource {target}     The object.
 * @datasource {likes}      The likers for the object
 * @template {list} Shows the faces of all users who liked the object
 * @example <div data-hull-component="likes/list@hull" data-hull-id="entity:http://hull.io"></div>
 * @example <div data-hull-component="likes/list@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="likes/list@hull" data-hull-id="HULL_ID"></div>
 * @example <div data-hull-component="likes/list@hull" data-hull-id="entity:YOUR_UNIQUE_ID"></div>
 */

Hull.component({
  type: 'Hull',

  templates: ["list"],
  refreshEvents: ['hull.likes.change.**'],

  datasources: {
    target: ':id',
    likes: ':id/likes'
  }
});
