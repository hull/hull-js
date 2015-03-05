Hull.init({
  platformId: 'YOUR_PLATFORM_ID',
  orgUrl: 'http://your.app.domain.tld',
  // jsUrl: 'http://your.local.dev/'
  // name: "name your app",
  debug: true
});

Hull.ready(function(hull, me, platform, org){
  console.log(me)
})
