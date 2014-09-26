/**
 * 
 * Shows a set of Share buttons with the specified URLs and Text
 *
 * @name Button
 * @param {String} url URL to share
 * @param {String} providers A comma-separated list of providers to use. Supported: facebook, twitter, google, likedin
 * @tmpl {button} The button renderer
 * @example <div data-hull-component="share/button@hull" data-hull-text="Hull.io, an open platform for social apps" data-hull-url="http://hull.io" data-hull-providers='facebook,twitter'></div>
 */
Hull.component({
  type: 'Hull',

  templates: ['button'],

  options: {
    text: 'Hull.io Rocks',
    url: 'http://hull.io',
    providers: 'facebook,twitter,linkedin,google'
  },

  requiredOptions:['text', 'url'],

  sharers:{
    facebook: {
      sharer:'http://facebook.com/sharer/sharer.php?',
      url:'u',
      text:''
    },
    twitter: {
      sharer:'http://twitter.com/intent/tweet?',
      url:'url',
      text:'text'
    },
    linkedin: {
      sharer:'http://www.linkedin.com/shareArticle?mini=true&',
      url:'url',
      text:'title'
    },
    google: {
      sharer:'https://plus.google.com/share?',
      url:'url',
      text:''
    }
  },

  beforeRender: function(data) {
    var self = this;
    var _ = this.sandbox.util._

    data.text = encodeURIComponent(this.options.text);
    data.url = encodeURIComponent(this.options.url);

    var providers = this.options.providers.replace(' ','').split(',');

    if(!providers.length){
      providers = _.keys(this.sharers);
    }

    var buttons = _.map(providers,function(p){
      var s = self.sharers[p];
      var link = s.sharer;

      if(s.url){
        link += s.url+'='+data.url
      }

      if(s.text){
        link += '&'+s.text+'='+data.text
      }

      return {
        name: p,
        link: link
      }

    });

    data.buttons = buttons;
    return data;
  },

  actions:{
    share: function(e, data){
      var url = e.target.href;
      var provider = e.target.rel;
      var width = 500;
      var height = 350;
      window.open(url, provider, "status=no,height=" + height + ",width=" + width + ",resizable=yes,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
      this.track('hull.share.open',{
        url: url,
        provider: provider
      })
    }
  }
});
