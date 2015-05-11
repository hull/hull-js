'use strict';

import emptyFunction from '../utils/empty-function';

function initializeShopifyPlatform(context, options, hull) {
  const { customerId, accessToken } = options;

  if (/^[0-9]+$/.test(customerId) && !accessToken) {
    hull.api.put('services/shopify/customers/' + customerId).then(function() {
      document.location.reload();
    });
  }

  Hull.on('hull.user.logout', function() {
    document.location = '/account/logout';
  });
}

function getAppInitializer(app) {
  if (app.type === 'platforms/shopify_shop') {
    return initializeShopifyPlatform;
  } else {
    return emptyFunction;
  }
}

function initializeApp(context, options, hull) {
  const initializer = getAppInitializer(context.app);

  return initializer(context, options, hull);
}

export default initializeApp;

