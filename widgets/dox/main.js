define(['./prism'], function(){
  return {
    type: "Hull",
    templates: ["dox", "widget","template"],

    datasources: {
      dox: function() {
        var widgets=this.options.inspect.split(',');
        var promises = _.map(widgets,function(w){
          var s = w.replace(/^\s+|\s+$/g, ''); //IE-compatible .trim()
          var dfd = $.getJSON('http://hull-js.s3.amazonaws.com/0.2.0/docs/'+s+'/main.json');
          // var dfd = $.getJSON('http://localhost:3001/dist/0.2.0/docs/'+s+'/main.json');
          return dfd;
        });
        return $.when.apply(this, promises);
      }
    },
    beforeRender: function(data) {
      data.dox = data.dox[0];
      data.inspect = this.options.inspect;
      _.each(data.dox.widget,function(widget){
        var name = _.find(widget.tags, function(tag){
          if (tag.type=='name'){
            return true;
          } else {
            return false;
          }
        });
        widget.name = name;
      });
      return data;
    },
    afterRender: function(){
      Prism.highlightAll()
    }
  }
});
