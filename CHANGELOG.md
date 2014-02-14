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
* [127] Fixes `events` hash usage in components

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
