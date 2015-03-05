Hull.init({
  debug: true,
  appId: '5103a56f93e74e3a1f000012',
  orgUrl: 'http://hull-demos.hullapp.io',
  // appId: '5257fd08dea4dfd8a4000033',
  // orgUrl: "http://testme.hullapp.dev",
  // jsUrl: "https://hull-js.s3.amazonaws.com",
  jsUrl: "http://js.hull.dev/dist",
  sources: {
    'default' : '/aura_components'
  }
}, function(hull,me,app,org){
  updateMe(me)
  console.log('Init done', me)
});

updateMe = function(me){$('.log').append(JSON.stringify(me,null,2)) }
Hull.on('*',updateMe)

$(function(){
  $('.tweet').on('click',function(e){
    e.preventDefault();
    Hull.share({
      provider:'twitter',
      params:{url:'http://twitter.com'}
    }).then(function(a){
      console.log('Shared!', arguments)
    });
  })
  $('.share_facebook').on('click',function(e){
    e.preventDefault();
    Hull.share({
      provider:'facebook',
      params:{href:'http://google.com'}
    }).then(function(a){
      console.log('Shared!', a)
    });
  })
  $('.feed_facebook').on('click',function(e){
    e.preventDefault();
    Hull.share({
      provider:'facebook',
      method:'feed',
      params:{link:'http://google.com', caption:'cool'}
    }).then(function(a){
      console.log('Shared!', a)
    });
  })
  $('.login_facebook').on('click',function(e){
    e.preventDefault();
    Hull.login({
      provider:'facebook',
      params:{
        scope:'email,user_likes,user_about_me,user_actions.books',
        display:'page'
      }
    });
  })

  $('.login_facebook_popup').on('click',function(e){
    e.preventDefault();
    Hull.login({
      provider:'facebook',
      strategy:'popup',
      params:{
        scope:'email,user_likes,user_about_me,user_actions.books'
      }
    });
  })

  $('.login_facebook_popup_redirect').on('click',function(e){
    e.preventDefault();
    Hull.login({
      provider:'facebook',
      strategy:'popup',
      redirect_url: 'http://hull.io'
    });
  })

  $('.login_facebook_redirect_auto').on('click',function(e){
    e.preventDefault();
    Hull.login({provider:'facebook', strategy:'redirect'});
  })
  $('.login_facebook_redirect').on('click',function(e){
    e.preventDefault();
    Hull.login({provider:'facebook', strategy:'redirect', redirect_url:'http://hull.io'});
  })



  $('.link_twitter').on('click',function(e){
    e.preventDefault();
    Hull.linkIdentity({provider:'twitter'}).then(function(currentUser){
      console.log(currentUser);
    });
  })

  $('.login_email').on('click',function(e){
    e.preventDefault();
    Hull.login('romain@unity.fr','actorios')
  })

  $('.login_email_ajax').on('click',function(e){
    e.preventDefault();
    Hull.login('romain@unity.fr','actorios')
  })

  $('.login_email_redirect').on('click',function(e){
    e.preventDefault();
    Hull.login({
      login:'romain@unity.fr',
      password:'actorios',
      redirect_url:'http://hull.io',
      strategy:'redirect'
    })
  })
  $('.share').on('click',function(e){
    e.preventDefault();
    // Hull.api({provider:'facebook', path: 'ui.share'},{
    //   href: 'https://developers.facebook.com/docs/',display:'popup',
    // }, function(response){});
    var url = "https://www.facebook.com/dialog/share?app_id=492936654112493&&href=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2F&redirect_uri=https://ugc.hullapp.io/api/v1/me?share_id=123p1o2iu31-9238"
    window.my_share_window = window.open(url,'my_window');
  });
  $('.logout').on('click',function(e){
    // e.preventDefault();
    Hull.logout();
  })

})
