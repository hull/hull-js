define(['./prism'], function(){
  return {
    type: 'Hull',

    templates: [
      'dox',
      'widget',
      'template'
    ],

    datasources: {
      dox: function() {
        return $.getJSON(this.getWidgetSource(this.options.inspect));
      }
    },

    beforeRender: function(data) {
      var dox = data.dox = data.dox[0];

      dox.templates = _.map(dox.templates, function(content, name) {
        return {
          name: name,
          content: content,
          path: [this.options.inspect, '/', name, '.hbs'].join('')
        };
      }, this);

      _.each(dox.widget, function(widget){
        widget.name = _.find(widget.tags, function(tag){
          return (tag.type === 'name') ? true : false;
        });
      });

      return data;
    },

    afterRender: function(){
      this.$('pre').not('[class*="language"]').addClass('language-markup');
      Prism.highlightAll();
    },

    getWidgetSource: function(widget) {
      var source = [];

      source.push(this.options.source || 'http://hull-js.s3.amazonaws.com/');
      source.push(Hull.version);
      source.push('/docs/');
      source.push(widget.replace(/^\s+|\s+$/g, ''));
      source.push('/main.json');

      return source.join('');
    }
  };
});
