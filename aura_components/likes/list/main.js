/**
 * ## Likes list
 *
 * Shows the lists of all users who `liked` an object. Likes are not connected to facebook or any other network
 * You can use this as "favorite", "starred", "want"... or of course "like".
 *
 * ### Examples
 *
 *     <div data-hull-component="likes/list@hull" data-hull-id="HULL_ID"></div>
 *     <div data-hull-component="likes/list@hull" data-hull-id="YOUR_UNIQUE_ID"></div>
 *     <div data-hull-component="likes/list@hull" data-hull-id="ANY_URL"></div>
 *
 * ### Template
 *
 * - `list`: Shows the faces of all users who liked the object
 *
 */

Hull.define({
  type: "Hull",

  templates: ["list"],
  refreshEvents: ['hull.like.**'],

  datasources: {
    target: ':id',
    likes: ':id/likes'
  },
  options: {
    id: 'me'
  },
  initialize: function () {
    this.actions.do();
  },

  actions: {
    do: function () {
      console.log(this);
    }
  }
});
