/**
 * Shows all lists attached to an object
 * 
 * This component shows all the lists for which `id` is the owner
 *
 * @name All
 * @param {String} id The id of the owner which lists you want to display
 * @tmpl {all} Shows lists
 * @datasource {lists} Describes all the lists that belong to the `id` in parameter
 * @example <div data-hull-component="lists/all@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="lists/all@hull" data-hull-id="HULL_ID"></div>
 * @example <div data-hull-component="lists/all@hull" data-hull-id="entity:ANY_UNIQUE_ID"></div>
 */

Hull.component({
  type: 'Hull',
  templates: ['all'],
  requiredOptions: ['id'],
  refreshEvents: ['model.hull.me.change'],
  datasources: {
    lists: ':id/lists'
  }
});
