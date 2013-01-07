define(['lib/hull'], function(Hull) {

  window.app = Hull({
    name: "super app",
    orgUrl: 'http://aura.hull.dev',
    appId: '50e842b8cf9f4f1f00000004',
    debug: true,
    widgets: {
      sources: { 'default' : 'widgets/' }
    }
  });

});
