/**
 * # Reset widget
 *
 *
 */
define({

  type: "Hull",

  datasources: {
    entities: 'app/entities',
    activities: 'app/activity'
  },

  options:{
    relations: 'comments,likes,reviews'
  },

 templates: ['reset'],

  beforeRender: function(data){data.relations = this.options.relations.split(',')
    _.map(data.entities,function(entity){
      entity.relations=_.map(data.relations,function(relation){
        return {
          name:relation,
          count:entity.stats[relation]
        }
      });
    });
    data.isAdmin = this.sandbox.isAdmin
    return data;
  },

  actions: {

    delete: function(e, args) {
      event.preventDefault();
      var target = args.data.target;
      var id = args.data.id;
      if(id){
        var route = id;
        var $parent = args.el.addClass('is-removing').parents('[data-hull-id="'+ id +'"]');
        if(target){route = route+'/'+target}
        this.api.delete(route).then(function (res) {
          if(target){
            args.el.remove();
          } else {
            $parent.remove();
          }
        });
      }
    },
  }

});
