/**
 * 
 * Fetches and format a Component Documentation [Obsolete]
 *
 * @name Component Documentation
 * @param {String} inspect The name of the component to inspect
 * @datasource {dox} Component Documentation
 * @example <div data-hull-component="developer/dox@hull" data-hull-inspect='login/button'></div>
 */
Hull.component({
  type: 'Hull',

  templates: [
    'dox',
    'component',
    'template'
  ],

  require:['prism'],

  datasources: {
    dox: function() {
      return $.getJSON(this.getComponentSource(this.options.inspect));
    }
  },

  beforeRender: function(data) {
    console.warn("Data Dox", data);
    var dox = data.dox;

    dox.templates = this.sandbox.util._.map(dox.templates, function(content, name) {
      return {
        name: name,
        content: content,
        path: [this.options.inspect, '/', name].join('')
      };
    }, this);

    var self = this;
    this.sandbox.util._.each(dox.component, function(component){
      component.name = self.sandbox.util._.find(component.tags, function(tag){
        return (tag.type === 'name') ? true : false;
      });
    });

    return data;
  },

  afterRender: function(){
    this.$('pre').not('[class*="language"]').addClass('language-markup');
    Prism.highlightAll();
  },

  getComponentSource: function(component) {
    var source = [];

    source.push(this.options.source || 'http://hull-js.s3.amazonaws.com/');
    source.push(Hull.version);
    source.push('/docs/');
    source.push(component.replace(/^\s+|\s+$/g, ''));
    source.push('/main.json');

    return source.join('');
  }
});
