/**
 * 
 * 
 * List and delete entities, their associated comments, likes, reviews, and activity feed entries.
 *
 * @name Reset
 * @param {String} relations Optional, Type of objects to fetch for the listed entities (default: comments, likes, reviews)
 * @datasource {entities}   Entities for the current App
 * @datasource {activities} Activity feed entries for the current App 
 * @template {reset} List the entities and shows delete buttons 
 * @example <div data-hull-component="admin/entities@hull"></div>
 */

Hull.component({

  type: "Hull",

  datasources: {
    entities: 'app/entities',
    activities: 'app/activity'
  },

  options:{
    relations: 'comments,likes,reviews'
  },

 templates: ['reset'],

  beforeRender: function(data){
    data.relations = this.options.relations.split(',');
    var self = this;
    this.sandbox.util._.map(data.entities, function(entity){
      entity.relations=self.sandbox.util._.map(data.relations,function(relation){
        var rel = entity.stats[relation] || 0;
        if (rel.count) rel = rel.count;
        return {
          name:relation,
          count: rel
        };
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
        if(target){
          route = route+'/'+target;
        }
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
