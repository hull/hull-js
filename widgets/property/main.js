/**
 *
 * Displays a single property of an object.
 *
 * ## Examples
 *
 *     <div
 *          data-hull-widget="property@hull"
 *          data-hull-id="me"
 *          data-hull-property="name"
 *          data-hull-default-text="Not found"
 *     ></div>
 *
 * ## Options
 *
 * - `id`: Required. The id of the object for which we want to display a property.
 * - `property`: Required. The name of the property to be displayed. Can be a path
 *   if the property is nested (_eg_ `stats.likes`)
 * - `default-text`: The text to be displayed if the value does not exist
 *
 * ## Template
 *
 * - `property`: Displays the property with no markup. Markup must be in the parents widget
 *   for easier customization
 *
 */
define({
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
    var defaultText = this.options.defaultText || 'aa';
    var value = this.findProp(data.object, this.options.property);
    return {
      property: value !== undefined ? value : defaultText
    };
  },

  findProp: function (obj, prop) {
    "use strict";
    prop.split('.').forEach(function (_p) {
      obj = !obj ? undefined : obj[_p];
    });
    return obj;
  }
});
