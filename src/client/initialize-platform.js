'use strict';

import emptyFunction from '../utils/empty-function';

function initializeShopifyPlatform(context, options, hull) {
  const { customerId, accessToken } = options;
  if (/^[0-9]+$/.test(customerId) && !accessToken) {
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

function initializePlatform(context, options, hull) {
  const initializer = getPlatformInitializer(context.app);

  return initializer(context, options, hull);
}

export default initializePlatform;

