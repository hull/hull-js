'use strict';

import emptyFunction from '../utils/empty-function';

function initializeShopifyPlatform(context, currentConfig, hull) {

  const { customerId, accessToken, callbackUrl } = currentConfig.get();

  if (!customerId && hull.currentUser()) {
      hull.api('services/shopify/login').then(function(r) {
        // If the platform has multipass enabled and we are NOT inside the customizer
        // we can log the customer in without knowing his password.
        if (r.auth === 'multipass' && !(callbackUrl || "").match('__hull_proxy__')) {
          let l = 'https://' + document.location.host + '/account/login/multipass/' + r.token;
          window.location = l;
        } else {
          hull.logout();
        }
      });
  } else if (/^[0-9]+$/.test(customerId) && !accessToken) {
    hull.api('services/shopify/customers/' + customerId, 'put').then(function() {
      document.location.reload();
    });
  }

  Hull.on('hull.user.logout', function() {
    document.location = '/account/logout';
  });
}

function getPlatformInitializer(platform) {
  if (platform.type === 'platforms/shopify_shop') {
    return initializeShopifyPlatform;
  } else {
    return emptyFunction;
  }
}

function initializePlatform(context, currentConfig, hull) {
  const initializer = getPlatformInitializer(context.app);

  return initializer(context, currentConfig, hull);
}

export default initializePlatform;

