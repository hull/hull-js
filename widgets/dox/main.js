define(['./prism'], function(){
  return {
    type: "Hull",
    templates: ["dox", "widget","template"],

    datasources: {
      dox: function() {
        var widgets=this.options.inspect.split(',');
        var promises = _.map(widgets,function(w){
          var s = w.replace(/^\s+|\s+$/g, ''); //IE-compatible .trim()
          var dfd = $.getJSON('http://hull-js.s3.amazonaws.com/0.2.0/docs/'+s+'.json');
          return dfd;
        });
        return $.when.apply(this, promises);
      }
    },
    beforeRender: function(data) {

      data.dox = data.dox[0];
      data.inspect = this.options.inspect;
      return data;
    },
    afterRender: function(){
      Prism.highlightAll()
    }
  }
});
