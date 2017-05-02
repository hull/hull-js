# 0.10.0

* Remove support for various embed strategies on ships
* Remove dependency to polyfill service
* Upgrade dependencies
* Silence warnings on bluebird promises
* Support `data-*` configuration attributes on `src` tag
* Update Documentation
* Add `npm run build` task

# 0.9.0

* COMPLETE REWRITE OF THE LIBRARY.
* Gets rid of legacy methods
* Not dependent on jQuery or Aura.js anymore. Now only 44kb, much faster.
* Fully promise-ified. Every data call returns a promise
* Implements Smart login and Share strategy depending on device (popup or redirects)

---------
### Ships
[Compatiblity Table](https://docs.google.com/spreadsheets/d/13lwZP8XmhIBA84bpmKd-96nC9nE9tQaM0c0WgyQNHXI/edit#gid=0.8)

### New

Allow Initializing hull automatically with attributes in the `SCRIPT` tag,
Supported tags :
```
platform-id : platform ID
org-url : organization URL
debug : debug mode
verbose : verbose mode (when debug=true, logs even more stuff)
js-url : specify Hull Remote Url (automatically specified if using snippet)
embed : true|false //perform Hull.embed on init. Default: true
access-token :an Access token to use to log the user in.
proxy-mode [undocumented]
```

For this to work, the `hull.js` script tag needs to have `id='hull-js-sdk'`

#### `Hull.share` and `Hull.findUrl(node)`
These methods now try really hard to find a URL to share or to target, by traversing the DOM upwards for the closest matching `hull-link` or `href` attribute, looking for siblings at each level up to `body`. If not found, searches for `og:url` else, fallbacks to the window URL.

**Note** : In Sandboxed Ships, this method will start looking OUTSIDE the ship. No point in performing a lookup on Document parts the Ship author built.

#### New Methods
##### Reset Password
```
Hull.resetPassword(email=me.email, callback, errback) // => Promise
```

##### Send Email Confirmation
```
Hull.confirmEmail(email=me.email, callback, errback) // => Promise
```

---------

### Removed
#### `Hull.utils.entity.[encode|decode]()`
_Use `Hull.entity.[encode|decode]`_
#### `Hull.api[get|put|post|delete]()`
_Use `Hull.api(path,method)`_
#### `Hull.api.parseRoute()`
_Should not have been exposed in the first place._
#### `Hull.api.clearToken()`
_Removed_
#### `Hull.api.init()`
_Removed [Was undocumented]_
#### `hull.init` event
_Please use `hull.ready` instead_

---------

### Deprecated

#### `Hull.init(config, callback)`
We're phasing out in favor of auto-initialized code, You can get the same results by using `Hull.ready(callback)` which has the benefit of allowing multiple calls.

---------

### Changed

##### Events
* `hull.ready` event now returns `hull, me, platform, org`
* `hull.auth.update`, `hull.auth.login`, `hull.auth.logout`, `hull.auth.create` events are renamed `hull.user.update`, `hull.user.login`, `hull.user.logout`, `hull.user.create` and are emitted more reliably.
* A `hull.*.share` event is emitted when sharing using a network. an example would be `hull.facebook.share`
* A `hull.track` event is now emitted every time tracking happens, so you can subscribe to them and implement your own track handlers Hull.on(`hull.track`,{event:[String], data:[Object]});
* The `jsUrl` entry in the `Hull.init()` configuration hash now takes a full url (I.E. https://d3f5pyioow99x0.cloudfront.net/version/hull.js).
* Access the event's name from inside the event callback with `this.event`:
```js
  Hull.on('hull.ready',function(args...){
    console.log(this.event) //  "hull.ready"
  })
```
* `Hull.currentUser()` accepts a parameter, will return the field value. Works with all levels of nesting. Example: `Hull.currentUser('sign_in.created_at')`
* `Hull.share()` now has the following signature:
```js
//Default params.method: 'share'
Hull.share({provider:'facebook', path:'ui', params:{/*FB.ui params*/}});
//https://developers.facebook.com/docs/javascript/reference/FB.ui/

Hull.share({provider:'linkedin', params:{url: "http://example.com", title: "So Cool", source:'My App'}});
//https://developer.linkedin.com/docs/share-on-linkedin

//Default path : 'tweet'
Hull.share({provider:'twitter', path: 'tweet', params:{url: "http://example.com", message: "So Cool"}});
//https://dev.twitter.com/web/intents
//https://dev.twitter.com/web/tweet-button/web-intent
//https://dev.twitter.com/web/follow-button/web-intent

Hull.share({provider:'email', params:{subject:'This is really cool', body:"This works well", to:'romain@hull.io' }})

Hull.share({provider:'google'}) //Shares og:url or window.location
Hull.share({provider:'google', params:{url:'http://example.com'}}) //Shares example.com

```

##### Methods

###### `Hull.login()`, `Hull.logout()`, `Hull.linkIdentity()`, `Hull.unlinkIdentity()`
All those now return promises. When using Promises, please don't forget to add `.catch()` on your promise chain, so errors are not swallowed without notice.

These methods have the following signatures :

```js
Hull.login({provider:'xxxx',params:{...}}, callback, errback)
Hull.login({provider:'facebook',access_token:'xxx'}, callback, errback)
Hull.login({login:'xxx', password:'xxx',params:{...}},callback, errback)
Hull.logout(callback, errback)
Hull.linkIdentity({provider:'xxxx',params:{...}}, callback, errback)
Hull.linkIdentity({login:'xxx', password:'xxx',params:{...}}, callback, errback)
Hull.signup({facebook:{access_token:'xxxx'}}, callback, errback)
Hull.unlinkIdentity({provider:'xxxx',params:{...}}, callback, errback)
```

###### `Hull.ready(callback)`
returns a promise. Please end with `.done()` here too.

###### `Hull.embed(deploymentsArray)` and `Hull.onEmbed(callback)`
New methods for Ship Deployment. Ships can be either HTML Imports or `.js` files. They need to call `Hull.onEmbed(document, callback)`.
`callback` has the follwing signature :

```js
function callback(element, deployment, hull){
  //element == domElement
  //deployment = {
  //  org : {}
  //  settings: {}
  //  platform: {}
  //  ship : {}
  //}
  //hull = {local Hull instance, scoped to the current Ship}
}
```


###### `Hull.getDocument()`
From inside a ship, gets the HTMLImport `document`. Useful to manipulate import content and add stylesheets to: They will be scoped automatically

###### `Hull.getShipClassName()`
Returns a string in the form `.ship-SHIP_ID` that you can use to find all instances of this ship, or to prefix CSS and scope styles inside it. We use this internally to automatically prefix all CSS injected in the HTML Import and inside the instanciated ship's tree.

###### `Hull.setSize({width,height})`
From inside a sandboxed ship to allow setting container size

###### `Hull.autoSize(int|undefined|false)`
Recalculates iframe height to fit content without scrolling.
* If value == `INTEGER` then recalculates automatically every `INTEGER` milliseconds
* If value == `undefined`, recalculates once, and stops timers.
* If value == `false` then stops timers and does not resize one last time
* Automatically called when a Sandboxed ship is booted, every 300ms. Disable by calling `Hull.autoSize(false)` from the ship

###### `Hull.utils`
Expose our internal utils, containing several libraries. We could change those at any time but we thought you might be happy to avoid embedding them too if it was a fit.

###### `'on', 'onAny', 'offAny', 'once', 'many', 'off', 'emit'`
Expose more event methods (we're using [EventEmitter2](https://github.com/asyncly/EventEmitter2), refer to their docs for signature)

### Fixed

* `Hull.currentUser()` from inside the promise or callback of a User-changing method such as `Hull.logout` now properly returns the right user status


# 0.8.46

* Properly update bower.json and package.json, Do not botch release versions

# 0.8.45

* Share methods all return promises, even with Popup methods. They return response data if available

# 0.8.44

* Use redirect strategy by default on shopify for mobile browsers

# 0.8.43

* Rename @template to @tmpl in component docs. @template is now a reserved word in Dox

# 0.8.42

* Specify Size for Twitter Popup
* Add Release instructions to Readme

# 0.8.41

* Fix typo in popup code

# 0.8.40

* Update signature for Hull.login method calls to take one hash with a `params` sub-hash
* Initial version of Hull.share

# 0.8.39

* Allow redirect strategy login (for social and email/password)
* FB Auth: Use display: 'popup' option and smaller popup window

# 0.8.38

* Fix for browsers with 3rd party cookies disabled and (http://www.hull.io/docs/users/backend) : Use jquery ajaxSend to send user sig as a header

# 0.8.37

* `Hull.parse` now waits for Aura app to finish starting
* Instagram provider fix : expose pagination and meta from Instagram's response

# 0.8.36

* Fix loading issue when using Back button on Chrome (9dec8de)

# 0.8.30

* enforce contentType: 'application/json' for all non GET ajax requests from admin provider


# 0.8.29

* enforce dataType: 'json' for all non GET ajax requests from admin provider


# 0.8.21

* Updates Hull.currentUser() on user change #150

# 0.8.19

* Enhances compatibility down to jQuery 1.5 for components
* Updates Aura
* Improves styling for [Shopify](https://apps.shopify.com/hull-social-login) shops

# 0.8.18

* Fixes deploy and CSS minification
* Fixes ratings/vote component
* Fixes build in CircleCI by specifying a newer Node.js version

# 0.8.17

* Fixes overlapping events

# 0.8.16

* Fixes thre login window size because of a nasty FB message

# 0.8.15

* Guest login with lazy actions

# 0.8.14

* Updates custom jQuery to 1.11.0 in remote to avoid IE8 errors

# 0.8.13

* Allow AccessToken in Hull.init
* Enhances login and admin/registration components

# 0.8.12

* Reduces the number of API calls at init
* Better errors when init fails

# 0.8.11

* Fixes admin/user_profile component to delete badge with Admin API
* Adds Hull.ready(fn) for fn to be called as soon as Hull has finished loading
* Fixes Hull.parse

# 0.8.10

* Encodes URI at remote init
* Fixes votes/button component

# 0.8.9

* Sends BrowserId and SessionId to tracking calls
* Sends referrer, url and path to tracking calls

# 0.8.8

* Sends way less data to `hull.auth.login` tracking
* Updates Aura to avoid error-swallowing

# 0.8.7

* Version-fix of domready to maintain backward-compatibility

# 0.8.6

* Prevents Q from complaining about missing handlers
* Adds a console polyfill

# 0.8.5

* [134] Compatibility with Cordova

# 0.8.4

* Fixes Hull when opened from a `target="_blank"` link
* Bad provider in `Hull.login()` returns a rejected promise

# 0.8.3

* [133] Adds `Hull.signup(user)`
* [133] Adds `Hull.login(usernameOrEmail, password)`
* [129] Promises returned by `Hull.login()`, `Hull.linkIdentity` are rejected with `error` hash that contains the `reason` of the failure.
* Adds `Hull.linkIdentity()` and `Hull.unlinkIdentity()`

# 0.8.2

* [127] Fix `events` hash usage in components

# 0.8.1

* [125] Handles errors when JSONP requests fail

# 0.8.0

* Adds `Hull.currentUser()` to easily fetch the current connected user of false if not available
* Handles correctly when the auth popup windows are closed manually
* Can not do multiple concurrently running calls to `Hull.login()`
* `Hull.config` is now a function returning a clone of the whole configuration

# 0.8.0-rc8

* `Hull.data.api` has been renamed `Hull.api`
* The 3rd party APIs which need to be proxified are now batchable
* The success callback of `Hull.init()` receives 4 arguments: `Hull`, `me`, `app`, `org`
* `Hull.login()` resolves to the current user if successful
* `Hull.login()` and `Hull.logout()` return a promise
* `Hull.init.api(config, cb, errb)` creates an instance of Hull with API features only
* `Hull.config` exposes the original config passed to Hull.init()
* Events `hull.app.init`, `hull.login`, `hull.logout` are tracked from the API
* Removes `hull.auth.complete` and `hull.auth.failure` events for `hull.login` and `hull.logout`
* Adds Hull.util.Handlebars for easier customization
* Update to Handlebars 1.1.2
* Adds this.helpers to Components to declare custom Handlebars helpers for the Component's templates

# 0.8.0-rc1

* CONTRIBUTING.md is born
* Batch API
* More tests
* Hull.api as a standalone project
* Hull.{me|app|org} removed

# 0.7.12

*Changelog is born*
