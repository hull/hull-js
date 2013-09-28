/**
 * ## Property
 *
 * Displays a single property of an object.
 *
 * ### Examples
 *
 *     <div
 *          data-hull-component="object/property@hull"
 *          data-hull-id="me"
 *          data-hull-property="name"
 *          data-hull-default-text="Not found"
 *     ></div>
 *
 * ### Options
 *
 * - `id`: Required. The id of the object for which we want to display a property.
 * - `property`: Required. The name of the property to be displayed. Can be a path
 *   if the property is nested (_eg_ `stats.likes`)
 * - `default-text`: The text to be displayed if the value does not exist
 *
 * ### Template
 *
 * - `property`: Displays the property with no markup. Markup must be in the parents component
 *   for easier customization
 *
 */
Hull.define({
  type: 'Hull',

  templates: [
    'property'
  ],

  datasources: {
    object: ':id'
  },

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
