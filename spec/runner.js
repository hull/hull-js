/*jshint browser:true, debug: true */
/*global define:true, mocha:true, runMocha:true*/
var should;
define(['chai', 'sinonChai'], function(chai, sinonChai) {
  "use strict";

  window.chai         = chai;
  window.expect       = chai.expect;
  window.assert       = chai.assert;
  window.sinonChai    = sinonChai;
  should              = chai.should();
  chai.use(sinonChai);

  mocha.setup('bdd');

  console = window.console || function() {};

  // Don't track
  window.notrack = true;

  var specs = [
    'spec/lib/extensions/templates_spec',
    'spec/client/api_spec',
    'spec/lib/hullbase_spec',
    'spec/lib/hull_spec',
    'spec/client/datasource_spec',
    'spec/client/widget_spec',
    'spec/lib/extensions/auth_spec',
    'spec/client/api/params_spec'
  ];
  require(specs, runMocha);

});
