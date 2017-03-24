# Introduction

hull.js lets you authenticate users and perform API calls from your browser
It is the library you install when you paste a Platform snippet in your page's `HEAD` tag.

# Starting Hull

> Automatic initialization

```html
<script 
  id="hull-js-sdk"
  platform-id="YOUR_PLATFORM_ID"
  org-url="https://ORG_NAMESPACE.hullapp.io"
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
- If you do not need to use Ships or you need more control, you can disable auto-initialization and boot Hull manually. We recommend sticking with the automatic initialization if you don't have a specific scenario requiring manual init. </li>

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
embed | Boolean | Default:`true`. Skip embedding Ships in the page.
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
  console.log('Ships are available in page');
});
```

### `Hull.ready(fn)`

Use `Hull.ready()` to call a function as soon as `hull.js` is
initialized. If you call the function after the initialization is
done, the function is called immediately. Inside [Ships](/docs/apps/ships), You will probably use `Hull.onEmbed()` instead.

### `Hull.on()`

Register an event listener. See [events](#subscribe-to-an-event)

### `Hull.track()`

Track something. See [Tracking](#tracking)

<aside>
  These methods are available right away, even before <code>Hull.init()</code> is called. They queue and replay when initialization is complete.
</aside>

## Asynchronous snippet

```html
<%=hulljs_snippet(true)%>
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
If you're embedding the snippet with the `async` parameter, Hull will load asynchronously and the `Hull` object won't be available immediately.
You can define then a function called `hullAsyncInit` attached to `window`. It will get called when the Hull object is available.



# User signup and login

## Email Signup

```js
var user = {
  name: 'Steve Jackson',
  email: 'steve@acme.com',
  password: 's3cr3t',
  picture: 'http://placehold.it/100x100',
  username: 'steve'
};

Hull.signup(user).then(function(user) {
  console.log('Hello ' + user.name);
}, function(error) {
  console.log(error.message);
});
```

### `Hull.signup(user)`
Creates a User with an email and a password. If you want your Users to sign up with their social account check out `Hull.login(...)`.

Parameter | Type | Description
----------|------|------------
user | Hash | A hash that contains at least an `email` and a `password` field. You may add any additional fields like `name`, `username`, `picture`.


## Email/Username login

```js
var user = { login: 'steve@acme.com', password: 's3cr3t' };

Hull.login(user).then(function(user) {
  console.log('Hello ' + user.name ||  'there');
}, function(error) {
  console.log(error.message);
});
```

### `Hull.login(user)`
Logs a User in with an email or a username and a password. Returns a promise if strategy is `popup`

### Options:
The `user` hash accepts the following values:

Parameter | Type | Description
----------|------|------------
login         | String         | The email or the username of the User to log in.
password      | String         | The password of the User to log in
strategy      | String         | Optional. default: Smart. Values: `redirect` or `popup`, On mobile, set to `redirect` by default, On desktop, set to `popup`. If set to `redirect`. `redirect` makes Safari behave better both on both Desktop and mobile.
 redirect_url | String         | Optional. default: Current URL. Where to send the user after login. Only used when `strategy='redirect'` 


## Resetting Password

```js
Hull.resetPassword('user@host.com').then(callback,errback); //=> Promise`
```

### `Hull.resetPassword(email)`
Sends a password reset email.
If email is empty or null, will fallback to the currently user's email


## Resending email confirmation

```js
Hull.confirmEmail('user@host.com').then(callback,errback); //=> Promise`
```

### `Hull.confirmEmail(email)`
Sends an confirmation email.
If email is empty or null, will fallback to the currently user's email


## Social Login

```js
Hull.login({
  provider:'facebook',
  strategy:'redirect',
  params: {
    display:'page',
    scope:'email,gender,age_range'
  }
});
```

> Example handling the full authentication flow

```js
// On auth success
var onAuthComplete = function(user) {
  console.log('Hello ' + user.name);
};

// On auth failure
var onAuthError = function(error) {
  var message, reason  = error && error.reason;
  switch(reason) {
    case 'email_taken':
      message = error.email + ' is already taken by User with id: ' + error.user_id;
      break;
    case 'auth_failed':
      message = 'User did not fully authorize or provider app is not well configured';
      break;
    case 'window_closed':
      message = 'User closed the window';
      break;
    default:
      message = 'Oops... Something went wrong on our side...';
  }
  console.log("Error: ", message)
};

$('button.facebook-login').on('click', function() {
  Hull.login({provider:'facebook'}).then(onAuthComplete, onAuthError);
});
```

### `Hull.login(options)`
Logs a User in with a third party provider. Returns a promise if strategy is `popup`

### Options:
The `options` hash accepts the following values:

Parameter | Type | Description
----------|------|------------
provider      | String         | The name of the provider your User will attempt to login with. The provider __MUST__ be configured on your App.
display       | String         | `Optional` default: Smart. Values: `popup` or `page`. Used for Facebook only, We figure this out automatically but let you override it here.
access_token  | String | `Optional` `Advanced` Pass-in a Social Network access token to log the user in directly with it, bypassing the authentication steps.
strategy      | String         | `Optional` default: Smart. Values: `redirect` or `popup`, On mobile, set to `redirect` by default, On desktop, set to `popup` by default. `redirect` makes Safari behave better both on both Desktop and Mobile.
redirect_url  | String         | `Optional` default: Current URL. Where to send the user on successful login. 
params        | Object         | `Optional` A Hash containting options to pass the social login provider.

### Params:
The `params` hash accepts additional arguments that will be forwarded to the Social Login provider's authentication page. For instance when using Facebook you can use this to ask for additional/custom permissions, and force the Login type to `page`:

[Check out the full list of facebook-supported permissions here](https://developers.facebook.com/docs/facebook-login/permissions/v2.1)

###  Social Login with Token
```js
Hull.login({provider:'facebook', access_token:'xxxxxx'}).then(function(me){
  //User Logged in with Facebook Access Token
})
```
If you have the Access Token for a User's Social account, you can pass it directly to Hull and we'll try and login / signup the User for you.


## Server-provided Access Token (Bring your own users)

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
  platform-id="YOUR_PLATFORM_ID"
  org-url="https://ORG_NAMESPACE.hullapp.io"
  access-token="SIGNED_JSON_WEB_TOKEN_FROM_BACKEND"
  src="https://js.hull.io/0.10.0/hull.js.gz"></script>
```

If you create a Hull access token (jwt) on the server, you can pass it and we'll log the user in for you. This is used in the [Bring your own users scenario](/docs/users/byou) where either have created in advance or are creating JWT access tokens on the fly for your users.

From there, you can use the [`linkIdentity`](#linking-an-additional-social-identity) method to link social accounts to this user, and get cross-domain Single sign-on for free.

## Login/Signup via Redirect

> Social Login:

```js
Hull.login({
  provider:'facebook',
  strategy:'redirect',
  redirect_url:'http://example.com' //optional
});
```

> Email+password

```js
Hull.login({
  login:'user@example.com',
  password:'12345',
  strategy:'redirect',
  redirect_url:'http://example.com' //optional
});
```

For a more robust but more intrusive login flow (The entire page will be reloaded), you can choose to log in customers with a redirect instead of a Popup or an AJAX call. This makes the login flow behave better with Safari on both iOS and Desktop, especially when 3rd party cookies are disabled, and works aroud several iOS 8 bugs related to closing windows.

This is done with the following signature:

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

## Linking an additional social identity
### `Hull.linkIdentity(options, callback, errback)`
```js
Hull.linkIdentity({provider: 'twitter'}).then(function() {
  console.log('Twitter identity has been linked');
}, function(error) {
  if (error.reason == 'identity_taken') {
    console.log('Twitter identity is already linked to another user');
  } else if (error.reason === 'auth_failed') {
      console.log('User did not fully authorize or provider app is not well configured');
  } else if (error.reason === 'window_closed') {
      console.log('User closed window');
  } else {
    console.log('Something went wrong on Hull side...');
  }
});
```
Adds an identity from third party providers to the current user.
Once added the User will be able to use the identity to log in.

### Options object
Parameter | Type | Description
----------|------|------------
provider | String | The name of the provider your User will attempt to login with. The provider __MUST__ be configured on your app's dashboard.


## Unlinking a social identity
### `Hull.unlinkIdentity(options, callback, errback)`
Removes the given identity from the current user.

### Options
Parameter | Type | Description
----------|------|------------
provider      | String         | The name of the provider your User will attempt to login with.
The provider __MUST__ be attached to your app.

```js
/**
 * Unlink an Identity from a Hull User
 * @param  {options} An options Hash
 * @param  {callback} Success callback
 * @param  {errback} error callback
 * @return {Promise} A promise
 */
Hull.unlinkIdentity({provider: 'twitter'}).then(function() {
  alert('Twitter identity has been unlinked');
}, function(error) {
  console.log(error.message);
});
```

# Accessing Data

The main way to access all the Hull APIs is the **Hull.api()** method. It lets you make calls to both the API and to external networks. The method returns a native or polyfilled promise, so you can use `then` and `catch`.

## Hull API

```js
var superbadUid = Hull.entity.encode("http://www.imdb.com/title/tt0829482/");
//"~aHR0cDovL3d3dy5pbWRiLmNvbS90aXRsZS90dDA4Mjk0ODI="

//Fetch comments on the superbad entity:
Hull.api(superbadUid + '/comments').then(function (comments) {
  console.log(comments);
}).catch(function(error){
  console.log('Something went wrong', error)
});

// It Also works with Hull Objects:
var commentId = '52e568a57d9bcc595a001b42'
Hull.api(commentId).then(function(comment){
  console.log(comment)
});

//Retrieve data for the current user.
Hull.api("me").then(function(account){
    console.log('This is my Hull account data', account);
}).catch(function(error){
  console.log('Something went wrong', error)
});

//Create a comment
Hull.api(superbadUid + '/comments', 'post', {
  description: 'Super awesome comment'
}, function () {
  console.log('Comment posted!');
});

//Like something
var commentId = '52e568a57d9bcc595a001b42'
Hull.api(commentId+'/likes','post');
```

### `Hull.api(route, method, params, callback, errback)`

Returns a promise with the response from the api at `route`. Reads or write data and returns a promise with the result. You can use either promises or callbacks to get the result back.

#### Method Parameters
Parameter  | Description
-----------|-----------------------
route    | A `String`, composed of a Hull Object ID or a Base64-encoded String (we call this an Entity) and the endpoint of the request. ( _eg._ `HULL_ID/comments`). 
method   | The HTTP method to use for the request. Defaults to `GET`
callback | Success callback. The method accepts one parameter, the value returned by the request.
errback  | Failure callback. The method accepts one parameter, the error explaining the failure.

### `Hull.api(routeObject...)`

```js
var superbadUid = Hull.entity.encode("http://www.imdb.com/title/tt0829482/");
Hull.api({
  path: superbadUid + '/comments',
  provider: 'hull', //Could have been omitted, as it is the default value
  params: {} //Could have been omitted, as it is empty
}, function (comments) {
  console.log(comments);
});
```

The `route` parameter can also be an `Object` with the following keys:

### Route Object Parameters
Parameter  | Type  | Description
-----------|-------|----------------
path     | String | The endpoint of the request, built the same way as previously
provider | String | Name of the provider to fetch the data from. Acceptable values depend on the authentication [services linked with your app](/docs/references/services). The default, always available provider, is `hull`. If you configured your Facebook service, `facebook` is available for instance.
params   | Object | Data to send, or Query params



## Accessing external networks
```js
//Request current user's facebook profile
Hull.api({provider: "facebook", path: "me"}, function(response){
  console.log(response);
});
Hull.api({provider: "twitter", path: "statuses/user_timeline"}, function(response){
  console.log(response);
});
```
When a User logs in with a third party network (think Facebook, Twitter, Github...), Hull lets you make calls through this network's API with the same method. We handle proxying the calls, so you can access the data client-side from all networks seamlessly. Some networks impose rate limits, so you might want to design your app to take them into account.


## Getting current User
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

## Getting current configuration

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

### Encoding a String to an Entity Unique ID

`Hull.entity.encode()` encodes a String to base64-valid entity Unique ID, for use in a `Hull.api()` call.

```js
Hull.entity.encode("http://www.imdb.com/title/tt0829482/");
//=> "~aHR0cDovL3d3dy5pbWRiLmNvbS90aXRsZS90dDA4Mjk0ODI="
```

### Decoding an Entity UID

`Hull.entity.decode()` decodes an Entity Unique ID back into a String.

```js
Hull.entity.decode("~aHR0cDovL3d3dy5pbWRiLmNvbS90aXRsZS90dDA4Mjk0ODI=");
//=> "http://www.imdb.com/title/tt0829482/"
```

### Flagging content

#### Hull.flag()
The `Hull.flag` method is syntactic sugar for the `/flag` API route. It lets users report content as inappropriate like this:

```js
var commentId = '52e568a57d9bcc595a001b42';
Hull.flag(commentId);
```

# Events

## Subscribe to an event

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

### Event list
Event Name | Description | Arguments
-----------|-------------|----------
hull.ready        | `hull.js` has finished loading. | `Hull`, `me`, `app`, `org`
hull.ships.ready  | Ships are loaded.               | nothing
hull.user.create  | User signed up.                 | `me`
hull.user.login   | User logged in.             | `me`
hull.user.logout  | User logged out.            | `me`
hull.user.fail    | User failed to log in.      | `error`
hull.user.update  | User updated any property   | `me`
hull.PROVIDER.share | `Hull.share()` called     | nothing
hull.track       | `Hull.track()` called. Use to funnel events to your analytics tool | `properties`
hull.traits      | `Hull.traits()` called. Use to send properties to your CRM or customer-centric database | `event`

### Parameters
Parameter | Type | Description
----------|------|-------------
evtName | String  | The name of the event to attach to.
cb      | Function | The function to be executed when the event is triggered.

## Unsubscribe from an event
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

## Emit an event.

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

# Sharing

Sharing as anonymous or authenticated user, from a Mobile or Desktop creates a lot of headaches for a developer.
We expose a simple sharing method that makes it easier to share the right thing the right way without restricting you in any manner,
and handles tracking and attribution correctly.

### `Hull.share(options)`

> To share content on Facebook, use the following code:

```js
$('.btn').on('click',function(){
  Hull.share({
    provider:'facebook', //share on Facebook
    method: 'share', //Facebook allows more than one sharing dialog, choose the one you want.
    anonymous: true, //Allow anonymous sharing, I.E. without requring a login beforehand? Default: false.
    params:{
      redirect_uri: 'http://destination_page', //Where to redirect the user in the popup after he shared. Mandatory
      display: 'popup', //popup || iframe. Optional. Default: Smart depending on connection status and device. Iframe for desktop, Popup for mobile
      href: 'http://google.com' //Params passed to the sharing dialog.
      //Read more about params here https://developers.facebook.com/docs/javascript/reference/FB.ui
    }
  }).then(function(response){
    //response here.
    //Depending on the sharing strategy, it will either be the response from facebook (when using an inline sharing), or {display:'popup'} if using the Popup strategy, for mobile and anonymous users for instance.    
  });
});
```

> For Email : 

```js
$('.btn').on('click',function(){
  Hull.share({
    provider:'email', //share on Twitter
    params:{
      subject: 'http://hull.io is cool',
      body: 'Look at this !'
    }
  }).then(function(response){
    //response here.
  });
});
```

> For Twitter : 

```js
$('.btn').on('click',function(){
  Hull.share({
    provider:'twitter', //share on Twitter
    params:{
      url: 'http://hull.io', // https://dev.twitter.com/web/intents#tweet-intent for all parameters.
    }
  }).then(function(response){
    //response here.
    //This won't be alle    
  });
});
```

> For Google Plus : 

```js
$('.btn').on('click',function(){
  Hull.share({
    provider:'google', //share on Twitter
    params:{
      url: 'http://hull.io'
    }
  }).then(function(response){
    //response here.
  });
});
```

> For Linkedin : 

```js
$('.btn').on('click',function(){
  Hull.share({
    provider:'linkedin', //share on Twitter
    params:{
      url: 'hull.io', // https://dev.twitter.com/web/intents#tweet-intent for all parameters.
    }
  }).then(function(response){
    //response here.
  });
});
```

> For Whatsapp (mobile only) : 

```js
$('.btn').on('click',function(){
  Hull.share({
    provider:'whatsapp', //share on Twitter
    params:{
      url: 'http://hull.io'
      text: 'This is amazing'
    }
  }).then(function(response){
    //response here.
  });
});
```


Options is an object with the follwing params:

#### Options parameter

Parameter  | Description
-----------|-----------------------
provider   | The network provider where to share. Supported values : `facebook` `twitter` `google` `email` `whatsapp` `linkedin`
method     | Optional, a method to use when sharing, Twitter and Facebook support more than one.
anonymous  | Wether to allow sharing as an anonymous user or to request Login before. Default: `true`
params     | Object passed to the destination network, as a querystring.

# Tracking

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
- When using Ships, the scoped `hull` object you receive in the `Hull.onEmbed` callback adds information about the current ship. This is the object you should use, instead of the global `Hull` object.



#### Several events are already tracked automatically.

* All `PUT`, `POST`, `DELETE` API calls track data automatically. Checkout the [API Reference](/docs/references/api) for details on each tracking call.
* Login, Logout and Signup methods do tracking calls for you. No need to add them.

<aside>
  This method is available immediately at launch
</aside>

# Traits


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

> Whenever possible, we will coerce the type of the parameters to the type of the trait:

```js
Hull.traits({ 'number_of_coconuts': {operation: 'inc', value: "123"} }) //Increases number of coconuts by 123
```

### `Hull.traits({trait_name: value})`
Sets the `value` to the trait of name `trait_name`.

A trait is a property you can define on a User, for analytics and CRM purposes.
What is stored there is visible only for administrators.



- We support the following types: `String`, `Number`, `Date`, `Array`
- We infer the types of a trait so you don't have to specify it. Number and String types are inferred on the type of the value.
- To store a Date, define a trait that ends with `_at` such as `played_at`.
- Once the type of a trait is set, it can not be changed, but you can use as many traits as you like.

Traits let you segment your customers in the [Dashboard](http://dashboard.hullapp.io) with custom criteria.

<aside>
  This method is available immediately at launch
</aside>

# Ships

When used inside [Ships](/docs/apps/ships), Hull.js exposes methods to help you manage ships.

## Booting a ship

```js
Hull.onEmbed(function(rootNode, deployment, hull) {
  console.log('Hello, i am a Ship and i just started');
  console.log('Here is my root element : ', rootNode);
  console.log('and here is my environment: ', deployment);

  hull.track("event",{parameters}); //GOOD
  hull.share(...) //GOOD. Notice we're using hull instead of Hull
  Hull.track("event",{parameters}) //BAD

});
```

### `Hull.onEmbed(callback)`
Checkout [Booting your application](/docs/apps/ships#booting-your-application) in the Ships documentation for more details 

## Finding the closest url reference from a ship's root
### `hull.findUrl()`

```js
hull.findUrl() //http://some-url.com;
```

Navigates the DOM upwards from the Ship root element to find a URL either from a Link or a "data-hull-link" attribute.
Useful when trying to share something;

#### Searches in order:

- The DOM for any `href` or `data-hull-link` attribute
- OG Tags
- Window's current URL

## Disabling Ships Automatic embedding

```html
<script
  id="hull-js-sdk"
  embed="false"
  platform-id="54feb3b0574f8c7692000cfa"
  org-url="https://hull-demos.hullapp.io"
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

If for some reason you need to prevent auto-embedding of Ships, you can do so with the `embed=false` flag.
It will be then up to you to start the ships, [Here is where the boot usually starts](https://github.com/hull/hull-js/blob/master/src/hull.coffee#L58), see how to start it yourself.

### `Hull.embed`

```js
Hull.ready(function(hull, me, platform, org){
  Hull.embed(platform.deployments, {reset:false}, callback, errback);  
});
```

<aside class="warning">This is an advanced method, if you want to start Ships manually. you're on your own ;p</aside>

