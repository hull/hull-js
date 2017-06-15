# Introduction

hull.js lets you authenticate users and perform API calls from your browser
It is the library you install when you paste a Platform snippet in your page's `HEAD` tag.

# Starting Hull

> Automatic initialization

```html
<script 
  id="hull-js-sdk"
  data-platform-id="YOUR_PLATFORM_ID"
  data-org-url="https://ORG_NAMESPACE.hullapp.io"
  src="https://js.hull.io/0.10.0/hull.js.gz"></script>
```


> Manual initialization

```html
<script src="https://js.hull.io/0.10.0/hull.js.gz"></script>
<script>
  Hull.init({
    platformId: "YOUR_PLATFORM_ID",
    orgUrl: "http://YOUR_ORG.hullapp.io",
    debug:true,
    verbose:true
  });
</script>
```

- If you use the platform Snippet as is, the library is initialized automatically with the right organization and platform.</li>
- If you do not need to use Connectors or you need more control, you can disable auto-initialization and boot Hull manually. We recommend sticking with the automatic initialization if you don't have a specific scenario requiring manual init. </li>

### Initialization parameters

The following parameters can be passed indifferently as hyphen-delimited params in the `SCRIPT` tag, or as CamelCased params in the `Hull.init()` call

#### Mandatory parameters.

Parameter | Type | Description
----------|------|------------
platformId | String | The ID of your platform.
orgUrl | String | The URL of your organization _e.g._ `YOUR_ORG.hullapp.io`

#### Optional parameters

Parameter | Type | Description
----------|------|------------
autoStart | String | Default: `true`, Auto Start Hull on load (call `Hull.init()`).
embed | Boolean | Default:`true`. Skip embedding Connectors in the page.
debug | Boolean | Default:`false`. Log messages. VERY useful during development to catch errors in promise chains.
verbose | Boolean | Default:`false`. Log even more things such as network traffic. Needs `debug: true`
accessToken | String | A signed JWT, telling Hull to automatically log-in a user fetched from your backend. See ["Bring your own users"](#bring-your-own-users)
anonymousId | String | Override the auto generated anonymousId. Use the one provided.  
sessionId | String | Override the auto generated sessionId. Use the one provided.


## Methods available immediately

```js
Hull.ready(function (hull, me, platform, org) {
  console.log('This is your wrapper for Hull', hull);
  if (me) { console.log("You're connected, and here's your user:", me); }
});

Hull.on('hull.ready', function (hull, me, platform, org) {
  console.log('Here you go!');
});

Hull.on('hull.ships.ready', function () {
  console.log('Connectors are available in page');
});
```

### `Hull.ready(fn)`

Use `Hull.ready()` to call a function as soon as `hull.js` is
initialized. If you call the function after the initialization is
done, the function is called immediately. Inside [Connectors](/docs/apps/ships), You will probably use `Hull.onEmbed()` instead.

### `Hull.on()`

Register an event listener. See [events](#subscribe-to-an-event)

### `Hull.track()`

Track something. See [Tracking](#tracking)

<aside>
  These methods are available right away, even before <code>Hull.init()</code> is called. They queue and replay when initialization is complete.
</aside>

## Asynchronous snippet

```html
<script 
  async defer
  id="hull-js-sdk"
  data-platform-id="YOUR_PLATFORM_ID"
  data-org-url="https://ORG_NAMESPACE.hullapp.io"
  src="https://js.hull.io/0.10.0/hull.js.gz"></script>

<script>
  window.hullAsyncInit = function(hull){
    console.log('Hull Async Init', hull),

    hull.on('hull.ready', function(hull, me, app, org) {
      console.log('Hull Ready from event')         
    });
    hull.on('hull.ships.ready', function() {
      console.log('Hull Ships Ready');
    });

    hull.ready(function(hull, me, app, org) {
      console.log('Hull Ready!');
    });
  }
</script>
```
If you're embedding the snippet with the `async defer` parameter, Hull will load asynchronously and the `Hull` object won't be available immediately.
You can define then a function called `hullAsyncInit` attached to `window`. It will get called when the Hull object is available.


## Identify users securely
To increase security, when identifying users as they use your product, we require you to generate an encoded string validating that the user is who he pretends to be. Generating that string is a pretty simple from your own backend.

You can then pass it to Hull to identify the user.[ Here's an article explaining how to generate this token](https://www.hull.io/docs/users/byou)

> Log the user in with a token

```js
var token='SIGNED_JSON_WEB_TOKEN_FROM_BACKEND';
Hull.login({access_token:SIGNED_JSON_WEB_TOKEN_FROM_BACKEND}).then(function(me){
  //User Logged in with Hull Access Token
})

```

> Or during initialization:

```js
Hull.init({
  platformId:'YOUR_PLATFORM_ID',
  orgUrl:'YOUR_ORG',
  accessToken:token
});
```

> Or directly in the Script tag: 

```html
<script
  id="hull-js-sdk"
  data-platform-id="YOUR_PLATFORM_ID"
  data-org-url="https://ORG_NAMESPACE.hullapp.io"
  data-access-token="SIGNED_JSON_WEB_TOKEN_FROM_BACKEND"
  src="https://js.hull.io/0.10.0/hull.js.gz"></script>
```

If you create a Hull access token (jwt) on the server, you can pass it and we'll log the user in for you. This is used in the [Bring your own users scenario](/docs/users/byou) where either have created in advance or are creating JWT access tokens on the fly for your users.

## Logging out
### `Hull.logout()`
```js
Hull.logout().then(function() {
  console.log('Goodbye');
}).catch(function(err){
  console.log('Something happened', err);
});
```
Logs the current User out.

## Getting the current User
> Example Response

```json
{
  "id": "50f5768ce78fa367da000001",
  "updated_at": "2015-11-19T11:04:28Z",
  "created_at": "2013-01-15T15:32:28Z",
  "name": "Firstname lastname",
  "username": null,
  "first_name": "Firstname",
  "last_name": "lastname",
  "description": null,
  "email": "user@host.com",
  "tags": [],
  "extra": {},
  "stats": {
    "actions": {
      "comments": 1,
      "email_notifications": 4,
      "links": 11
    },
    "liked": 2,
    "sign_in_count": 525
  },
  "picture": "https://gravatar.com/avatar/df02661a0c004b29a0c1971871a8d74b.png?s=200&d=blank",
  "type": "user",
  "confirmed": true,
  "is_admin": false,
  "approved": true,
  "profile": {},
  "contact_email": "user@host.com",
  "phone": "33620545662",
  "address": {},
  "main_identity": "github",
  "settings": {
    "notifications": {}
  },
  "identities": [
    {
      "id": "53185d8b440b64e6d802de05",
      "created_at": "2013-01-15T15:32:28Z",
      "name": "Firstname lastname",
      "description": null,
      "stats": {},
      "tags": [],
      "picture": "https://avatars.githubusercontent.com/u/9158?v=3",
      "type": "github_account",
      "provider": "github",
      "uid": "9158",
      "login": "user",
      "email": "user@host.com"
    },
    {
      "id": "53188c3c523c299eb600012d",
      "created_at": "2014-03-06T14:56:12Z",
      "name": "Firstname lastname",
      "description": null,
      "stats": {},
      "tags": [],
      "picture": "https://graph.facebook.com/550254742/picture?type=large",
      "type": "facebook_account",
      "provider": "facebook",
      "uid": "550254742",
      "email": "user@host.com",
      "first_name": "Firstname",
      "last_name": "lastname"
    }
  ],
  "last_seen_at": "2015-11-19T10:59:34Z",
  "sign_in": {
    "created_at": "2014-03-06T13:02:38Z",
    "app_id": "53175bb2235c73c8790032cd",
    "url": "https://accounts.hullapp.io/"
  }
}
```

### `Hull.currentUser()`

When a User is currently logged in, `Hull.currentUser()` returns the current User as an object literal. Otherwise, it returns `false`.

## Getting the current configuration

> Example Response

```json
{
  "platformId": "5113eca4fc62d87574000096",
  "orgUrl": "https://hull-demos.hullapp.io",
  "jsUrl": "https://d3f5pyioow99x0.cloudfront.net",
  "namespace": "hull",
  "assetsUrl": "d3bok9j91z3fca.cloudfront.net",
  "services": {
    "settings": {
      "facebook_app": {"appId": "Facebook App ID"},
      "twitter_app": {"appId": "Twitter App ID"},
      "github_app": {"appId": "Github App ID"},
      "instagram_app": {"client_id": "Instagram Client ID"},
      "tumblr_app": {"appId": "Tumblr App ID"},
      "linkedin_app": {"appId": "LinkedIn App ID", "scope": "r_basicprofile r_emailaddress r_network"},
      "google_app": {"appId": "Google App ID"},
      "hull_store": {
        "host": "hull.s3.amazonaws.com",
        "url": "http://hull-store.s3.amazonaws.com/",
        "file_param": "file",
        "params": {
          "success_action_status": "201",
          "AWSAccessKeyId": "AWS Access Key",
          "key": "hull-store/hull-demos/51044245f6e311c301000003/5113eca4fc62d87575000096/510fa2394875372512000009/${filename}",
          "acl": "public-read",
          "policy": "User-specific Policy",
          "signature": "User-specific Signature"
        }
      }
    },
    "types": {
      "auth": ["facebook_app", "twitter_app", "github_app", "instagram_app", "tumblr_app", "linkedin_app", "google_app"],
      "storage": ["hull_store"],
      "analytics": ["mixpanel"]
    }
  }
}
```

### `Hull.config()`

Returns an object containing all information about the current app and user, including keys to services:

# Utils

```js
//True if the current browser is a mobile browser;
hull.utils.isMobile()

//Cookie Utility. https://github.com/ScottHamper/Cookies
hull.utils.cookies()

//Object.assign polyfill
hull.utils.assign()

//Generates a unique Identifier
hull.utils.uuid()
```

# Messages

The Hull library embeds a message bus to which you can subscribe to be notified of lifecycle events, and emit your own events as needed.

## Subscribe to a message channel

> This method is available immediately at launch

```js
Hull.on('hull.init', function(hull, me, app, org) {});
Hull.on('hull.user.login', function(me) {});
Hull.on('hull.user.logout', function() {});
Hull.on('hull.user.fail', function(error) {});
Hull.on('hull.*.share', function(share) {});
Hull.on('hull.track', function(properties) {
  MyTracker.track(
    this.event, //Event Name
    properties
  );
});
```

> __Hint__: You can use wildcards in your event names to register to a class of events.

### `Hull.on(evtName, cb)`
Hull emits predefined events, and conforms to [EventEmitter2](https://github.com/asyncly/EventEmitter2)'s signature.
You subscribe to them with the `Hull.on()` method:

- The current Event name is available in `this.event`
- It is useful to adapt react on Hull's state

### Message list
Event Name | Description | Arguments
-----------|-------------|----------
`hull.ready`        | `hull.js` has finished loading. | `Hull`, `me`, `app`, `org`
`hull.ships.ready`  | Connectors are loaded.               | nothing
`hull.user.update`  | User updated any property   | `me`
`hull.track`       | `Hull.track()` called. | `properties`
`hull.traits`      | `Hull.traits()` called.  | `event`

### Parameters
Parameter | Type | Description
----------|------|-------------
evtName | String  | The name of the event to attach to.
cb      | Function | The function to be executed when the event is triggered.

## Unsubscribe from a message channel
> This method is available once the app has started. 

### `Hull.off(evtName, cb)`
```js
Hull.off('hull.ready',myFunction);
```

### Parameters
Parameter | Type | Description
----------|------|-------------
evtName       | String         | The name of the event the function must be detached from.
cb            | Function       | The function to be detached from the event.

Unregisters the function from the event. As usual in such cases, it the reference of the function that is important, not its body.
If you want to unregister a listener, take great care to ensure that when you do, you pass the __same memory reference__ than when you registered it.
There is no tool to help you do this, just proper engineering.

## Emit a message

> This method is available once the app has started.

```js
Hull.emit('my.own.event',properties);
Hull.on('my.own.event', function(properties){});
```

Use Hull as an event bus at will.
### `Hull.emit(evtName, data)`


Emits an event that will trigger all the registered listeners, passing them the `data` parameter.

### Parameters
Parameter | Type | Description
----------|------|-------------
eventName     | String         | The name of the event to be dispatched
data          | mixed          | Data that will be passed to the subscribers

### Other convenience methods
See [https://github.com/asyncly/EventEmitter2](https://github.com/asyncly/EventEmitter2).

- `Hull.onAny()`
- `Hull.offAny()`
- `Hull.once()`
- `Hull.many()`

# Tracking
Tracking is how you send to Hull the things that your users Do. Page views are sent automatically, but you will probably want to track additional, business-specific events, such as "Subscription activated", "Completed configuration" et al.

For each of those events, you can add arbitrary attributes, which will be fully recognized and usable form inside of Hull.

Hull differs from most other tracking solution in the aspect that it doesn't have hard limits as to how many different events you can send, nor how many attributes inside those events.

```js
Hull.track('event_name', {
  foo:'bar',
  arbitrary:'data'
}).then(function(res){
  //res should be equal to `true`
});
```

### `Hull.track(eventName, data)`
Track arbitrary additional data.

- If a user is logged in, events will be associated to him.
- When using Connectors, the scoped `hull` object you receive in the `Hull.onEmbed` callback adds information about the current connector. This is the object you should use, instead of the global `Hull` object.

# Traits

Traits are how you define who a user Is. You can use this to store business specific values, such as "birthdate", "number of integrations" et. al.

The first time we detect a new trait name (which are called Attributes in the Hull dashboard), we will try to recognize it's type.

- If the first trait we see is a boolean, it will be casted as a boolean.
- If it's a number, then it will be casted as a number
- If it's a String, and the trait name ends with `_date` or `_at` then we'll try to parse this as a date.
- If it's an Array we'll respect this.
- If it's a String we'll respect this.

```js
Hull.traits({'my new trait': 'has this value'});
```

> You can also update a value with some helpers:

```js
Hull.traits({'carrier': {value: 'swallow'}}) //Sets carrier to 'swallow'
Hull.traits({'carrier': {value: 'swallow', operation: 'set'}}) //Equivalent to the above

//Select the operation to apply
Hull.traits({'a_number': {value: 12}}) //Sets the trait to the integer `12`
Hull.traits({'a_number': {value: 12, operation: 'inc'}}) //The trait now has the value `24`
Hull.traits({'a_number': {value: 20, operation: 'dec'}}) //The trait now has the value `4`

//Work with multiple traits at once
Hull.traits({
  'numberA': {value: 12, operation: 'inc'},
  'numberB': {value: "this is cool"},
});
```

```
Hull.traits({
  string: "foo",
  fakeNumber: "123", //WILL BE RECOGNIZED AS A STRING
  realNumber: 123 //Will be recognized as a number
})
```
> Be mindful of the difference betwen strings and numbers:


### `Hull.traits({ trait_name: value })`
Sets the `value` to the trait of name `trait_name`.

A trait is a property you can define on a User, for analytics and CRM purposes.
What is stored there is visible only for administrators.

- We support the following types: `String`, `Number`, `Date`, `Array`
- We infer the types of a trait so you don't have to specify it. Number and String types are inferred on the type of the value.
- To store a Date, define a trait that ends with `_at` or `_date` such as `played_at` or `activation_date`
- Once the type of a trait is set, it can not be changed, but you can use as many traits as you like.

Traits let you segment your customers in the [Dashboard](http://dashboard.hullapp.io) with custom criteria.

<aside>
  This method is available immediately at launch
</aside>

# Connectors

Connectors can embed Client-side code, by having Hull.js inject their own Javascript in the page. When used inside [Connectors](/docs/apps/ships), Hull.js exposes methods to help you manage connectors.

## Booting a connector

Connectors can deploy JS code to your page, and expose settings in your dashboard you can use to configure them. Checkout [The docs on Client-side connectors](http://www.hull.io/docs/apps/ships#client-side) to learn more about what is available.

```js
Hull.onEmbed(function(rootNode, deployment, hull) {
  console.log('Hello, i am a Connector and i just started');
  console.log('Here is my root element : ', rootNode);
  console.log('and here is my environment: ', deployment);

  hull.track("event",{parameters}); //GOOD
  hull.share(...) //GOOD. Notice we're using hull instead of Hull
  Hull.track("event",{parameters}) //BAD

});
```

```javascript
const deployment = {
  ship: {} //the connector's settings,
  platform: {} //the platform's settings,
  
}
```

<aside>
  The `deployment` object will contain the data you need, including the connector's public settings:
</aside>


### `Hull.onEmbed(callback)`
Checkout [Booting your application](/docs/apps/ships#booting-your-application) in the Connectors documentation for more details 

## Disabling Connectors Automatic embedding

```html
<script
  id="hull-js-sdk"
  data-embed="false"
  data-platform-id="54feb3b0574f8c7692000cfa"
  data-org-url="https://hull-demos.hullapp.io"
  src="https://js.hull.io/0.10.0/hull.js.gz"></script>
```

> or 

```html
<script src="https://js.hull.io/0.10.0/hull.js.gz"></script>
<script>
  Hull.init({
    platformId:  "YOUR_PLATFORM_ID",
    orgUrl: "http://YOUR_ORG.hullapp.io",
    embed:false
  });
</script>
```

If for some reason you need to prevent auto-embedding of Connectors, you can do so with the `embed=false` parameter.
It will be then up to you to start the connectors, [Here is where the boot usually starts](https://github.com/hull/hull-js/blob/master/src/hull.coffee#L58), see how to start it yourself.

### `Hull.embed()` method

```js
Hull.ready(function(hull, me, platform, org){
  Hull.embed(platform.deployments, { reset:false }, callback, errback);  
});
```

<aside class="warning">This is an advanced method, if you want to start connectors manually. you're on your own ;p</aside>

