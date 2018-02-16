import emptyFunction from '../utils/empty-function';
import request from 'superagent';

function initializeShopifyPlatform(context, currentConfig, hull) {
  const { customerId, accessToken, callbackUrl } = currentConfig.get();

  try {
    const { pathname, search, hash } = document.location;
    const { domain, domain_redirect, ssl_enabled, alias_cart_enabled } = (context.app && context.app.settings) || {};

    if (domain_redirect && domain && pathname.match(/^\/account\/login/) && domain !== document.location.host) {

      const protocol = ssl_enabled ? 'https:' : 'http:';
      document.location.href = [
        protocol,
        '//',
        domain,
        pathname,
        search,
        hash
      ].join('');
    }
  } catch (err) {}

  const currentUser = hull.currentUser();

  if (!customerId && currentUser) {
      hull.api('services/shopify/login', { return_to: document.location.href }).then(function(r) {
        // If the platform has multipass enabled and we are NOT inside the customizer
        // we can log the customer in without knowing his password.

        const { inits_count } = currentConfig.identifySession() || {};

        if (r.auth === 'multipass' && inits_count < 2) {
          if (!(callbackUrl || '').match('__hull_proxy__')) {
            let l = 'https://' + document.location.host + '/account/login/multipass/' + r.token;
            window.location = l;
          }
        } else {
          hull.logout();
        }
      });
  } else if (/^[0-9]+$/.test(customerId) && (!accessToken || !currentUser)) {
    hull.api('services/shopify/customers/' + customerId, 'put');
  }

  if (customerId) {
    Hull.on('hull.user.logout', function() {
      document.location = '/account/logout';
    });
  }

  function aliasCart(cart = {}) {
    if (cart && cart.token) {
      const CART_ALIAS_KEY = 'cartAliasToken';
      const aliasToken = [cart.token, customerId].join('-');
      if (aliasToken !== currentConfig.storageGet(CART_ALIAS_KEY)) {
        hull.api('services/shopify/cart', { cart }, 'post').then(function() {
          currentConfig.storageSet(CART_ALIAS_KEY, aliasToken);
        });
      }
    }
  }

  // if (window.HullShopify && window.HullShopify.cart && window.HullShopify.cart.token) {
  //   aliasCart(window.HullShopify.cart);
  // } else if (window.HullShopify && window.HullShopify.template) {
  //   let browser = {};
  //   try {
  //     browser = currentConfig.identifyBrowser();
  //   } catch (err) {
  //     browser = {}
  //   }
  //   request.post('/cart.js')
  //          .send({})
  //          .set('Accept', 'application/json')
  //          .end((err, res={}) => {
  //             aliasCart(res.body);
  //           })
  // }    
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

module.exports = initializePlatform;
