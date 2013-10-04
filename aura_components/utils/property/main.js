/**
 * 
 * Displays a single property of an object.
 *
 * This component is useful to display a statistic for an object. Think of a comment count, but you can extrapolate to display any single property on any kind of object.
 *
 * If you're using entities, and since Hull fetches OpenGraph meta tags, you can use this to get access to any OpenGraph property from an entity you've created previously
 *
 * @name Property
 * @param {String} id Required. The id of the object for which we want to display a property.
 * @param {String} property Required. The name of the property to be displayed. Can be a path if the property is nested (_eg_ `stats.likes`)
 * @param {String} default-text The text to be displayed if the value does not exist
 * @template {property} Displays the property with no markup. Markup must be in the parents component
 * @example <div data-hull-component="utils/property@hull" data-hull-id="app" data-hull-property="stats.likes" data-hull-default-text="Not found"></div>
 */

Hull.component({
  type: 'Hull',

  templates: ['property'],

  datasources: {object: ':id'},

  refreshEvents: ['model.hull.me.change'],

  beforeRender: function(data) {
    "use strict";
    var defaultText = this.options.defaultText || 'No value';
    var value = this.findProp(data.object, this.options.property);
    return {
      property: value !== undefined ? value : defaultText
    };
  },

  findProp: function (obj, prop) {
    "use strict";
    var parts = prop.split('.');
    this.sandbox.util._.each(parts, function(p) {
      obj = !obj ? undefined : obj[p];
    });
    return obj;
  }
});
