/**
 * ##Lists/all
 *
 * In Hull, a list can contain any number of objects of any type.
 * Lists can be heterogeneous, that is to say a list can contain achievements, people or comments altogether.
 *
 * This component shows all the lists which owner is the `id` passed in parameter
 *
 * ### Options
 *
 * `id`: The id of the owner which lists you want to display
 *
 * ### Templates
 *
 * * `main`: A wrapper around the collection of lists to display
 * * `list`: How to display a list as an item
 *
 * ### Datasources
 *
 * `lists`: Describes all the lists that belong to the `id` in parameter
 *
 */
Hull.define({
  type: 'Hull',
  requiredOptions: ['id'],
  datasources: {
    lists: ':id/lists'
  },
  refreshEvents: ['model.hull.me.change'],
  templates: ['main', 'element']
});
