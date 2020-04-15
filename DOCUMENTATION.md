# Introduction

`hull.js` lets you track Customer data and recognize users.

It also lets you easily embed certain connectors in the page to inject functionality such as the [Intercom connector](https://hull-intercom.herokuapp.com) or the [Browser Personalization connector](https://hull-browser.herokuapp.com). For this go to the Platform section in your dashboard, and add the relevant connector. It will be added to the page without having to write code.

It is the library you install when you paste a Platform snippet in your page's `HEAD` tag.

# Booting Hull
To generate the Hull.js snippet for your website, first head to the Guides section ["Getting Started with Hull.js"](https://www.hull.io/docs/guides/getting-started/getting-started-hull-js/)

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

- If you use the platform Snippet as is, the library is initialized automatically with the right organization and platform.
- If you do not need to use Connectors, or if you need more over the boot sequence, you can disable auto-initialization and boot Hull manually. We recommend sticking with auto-init if you don't have a specific need for manual init.

## Initialization parameters

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
embed | Boolean | Default:`true`. Skip embedding connectors in the page.
debug | Boolean | Default:`false`. Log messages. VERY useful during development to catch errors in promise chains.
verbose | Boolean | Default:`false`. Log even more things such as network traffic. Needs `debug: true`
accessToken | String | A signed JWT, setting identity claims for the current user. See ["Bring your own users"](#bring-your-own-users)
anonymousId | String | Override the auto generated anonymousId. Use the one provided.
sessionId | String | Override the auto generated sessionId. Use the one provided.


## Methods available immediately

```js
Hull.ready(function () {
  console.log('This is your wrapper for Hull', Hull);
});

Hull.on('hull.ready', function (hull, me, platform, org) {
  console.log('Here you go!');
});
```

### `Hull.ready(fn)`

Use `Hull.ready()` to call a function as soon as `hull.js` is
initialized. If you call the function after the initialization is
done, the function is called immediately. Inside [Connectors](https://www.hull.io/docs/reference/connectors), You will probably use `Hull.onEmbed()` instead.

`Hull.ready()` can also be used as a promise like this:

```js
Hull.ready().then(() => {
  console.log('All good')
});
```

> Note than since Promises only resolve the first argument, we return a single object instead of 4 arguments.

#### `Hull.on()`

Register an event listener. See [events](#subscribe-to-an-event)

#### `Hull.track()`

Track events that happen in the page. See [Events Tracking](#events-tracking)

#### `Hull.traits()`

Set attributes. See [Attributes](#attributes)

#### `Hull.alias()`

Set an Alias for the current visitor. See [Alias](#alias)



<aside>
These methods are available right away, even before <code>Hull.init()</code> is called. They queue and replayed when initialization is complete.
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

    hull.on('hull.ready', function(hull) {
      console.log('Hull Ready from event')
    });
    hull.ready(function(hull) {
      console.log('Hull Ready!');
    });
  }
</script>
```

If you're embedding the snippet with the `async defer` parameter, Hull will load asynchronously and the `Hull` object won't be available immediately.

You can define then a function called `hullAsyncInit` attached to `window`. It will be called when Hull is initialized.


# Identifying users

## Auto-generated anonymous IDs

Whenever a user visits a page where Hull.js is initalized, we will create an identity for this user and display an `unknown` user in your dashboard. These users can be merged and aliased later if and when they provide more identifying information, such as an email or a User ID and this data and we find other matches in the database for these identifiers.

## Identifying by Email

You identify a User by Email by calling the `traits` method and passing it an email:

```js
Hull.traits({ email: "foo@bar.com" })
```

## Identifying by External ID

To increase security, when identifying users as they use your product, we need you to generate an encoded string validating that the user is who he pretends to be. Generating that string is a pretty simple thing from your own backend and increases security by preventing impersonation.

You can then pass it to Hull to identify the user.[ Here's an article explaining how to generate this token](https://www.hull.io/docs/reference/identity_resolution/)

> Or during initialization:

```js
Hull.init({
  platformId: YOUR_PLATFORM_ID,
  orgUrl: YOUR_ORG,
  accessToken: SIGNED_JSON_WEB_TOKEN_FROM_BACKEND
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

If you create a Hull access token (jwt) on the server, you can pass it and we'll log the user in for you. This is used in the [Bring your own users scenario](https://www.hull.io/docs/reference/identity_resolution/) where either have created in advance or are creating JWT access tokens on the fly for your users.


## Getting the current configuration

### `Hull.config()`

Returns an object containing all information about the current app and user, including keys to services:

> Example Response

```json
{
  "platformId": "5113eca4fc62d87574000096",
  "orgUrl": "https://hull-demos.hullapp.io",
  "jsUrl": "https://d3f5pyioow99x0.cloudfront.net",
  [...]
}
```

## Aliasing

### `Hull.alias(aliased_id)`

You can explicitely tell the platform to alias users. This will merge their profiles (unless they both have External IDs set).
The example below will add the following anonymous_id to the users's profile: `intercom:1234`.
As a result, when we fetch visitor 1234 from Intercom, both the Intercom data and web visitor data will be resolved to the same user.

```js
const visitorId = Intercom('getVisitorId'); //1234
//Aliases the intercom Visitor ID to the current user.
Hull.alias("intercom:"+visitorID)
```

# Capturing User Attributes

## `Hull.traits(attributes)`

The `traits` method lets you record Attributes for a given user.

You can use this to store factual properties, such as "birthdate", "number of connectors" et. al.
Attributes let you segment your customers in the [Dashboard](http://dashboard.hullapp.io)

The first time we detect a new attribute name (which are called Attributes in the Hull dashboard), we will try to recognize it's type.

- We support the following types: `String`, `Number`, `Date`, `Array`
- We infer the types of an attribute so you don't have to specify it. Number and String types are inferred on the type of the value.
- To store a Date, define an attribute that ends with `_at` or `_date` such as `played_at` or `activation_date`
- Once the type of an attribute is set, it can not be changed, but you can use as many attributes as you like.

### Attribute type casting
- If the first attribute we see is a boolean, it will be casted as a boolean.
- If it's a number, then it will be casted as a number
- If it's a String, and the attribute name ends with `_date` or `_at` then we'll try to parse this as a date.
- If it's an Array we'll respect this.
- If it's a String we'll respect this.


```js
Hull.traits({'my_new_attribute': 'has this value'});
```

```js
Hull.traits({
  string: "foo",
  fakeNumber: "123", //WILL BE RECOGNIZED AS A STRING
  realNumber: 123 //Will be recognized as a number
})
```
> Be mindful of the difference betwen strings and numbers:


### `Hull.traits({ attribute_name: value })`
Sets the `value` to the attribute of name `attribute_name`.

Once sent, attributes aren't exposed to users anymore.

<aside>
  This method is available immediately at launch
</aside>


### Atomic Operations
Sometimes, you only want to perform an update if the destination attribute was not present already, or increment/decrement a counter without knowing it's current. For this, we expose a few helpers to achieve this in a simple way.

```js
//Work with multiple attributes at once
Hull.traits({
  'numberA': {value: 12, operation: 'increment'}, //Increment the number
  'numberB': {value: 12, operation: 'decrement'}, //Decrement the number
  'name': {value: "foobar", operation: "setIfNull" }, //sets the value if nothing was there before
});
```


# Event Tracking

Capturing User Actions in the page

## `Hull.track(eventName, properties)`

Tracking is how you record user Actions.

Page views are sent automatically, but you will probably want to track additional, business-specific events, such as "Subscription activated", "Completed configuration" et al.

For each of those events, you can add arbitrary attributes, which will be fully recognized and usable form inside of Hull.

Hull differs from most other tracking solutions as it doesn't have any hard limits as to how many different events you can send, nor how many attributes inside those events.

```js
Hull.track('event_name', {
  foo:'bar',
  arbitrary:'data'
}).then(function(res){
  //res should be equal to `true`
});
```

### `Hull.track(eventName, data)`
Track a user event.

- If a user is logged in, events will be associated to him.
- When using Connectors, the scoped `hull` object you receive in the `Hull.onEmbed` callback adds information about the current connector. This is the object you should use, instead of the global `Hull` object.


# Alias

### `Hull.alias(anonymousId)`
Aliases a new anonymous ID for the current user.
Adds a new id to the current user's alias table, or links the current user to that ID if it already exists in Hull. You need to wait until Hull is initalized to call this method. The easiest way is to wrap it in `Hull.ready`

```js
Hull.ready(function(){
  Hull.alias("aid_123456");
});
```


# Form Tracking

### `Hull.trackForm(forms, eventName, data)`
Listen to form submissions and  performs a tracking call

- `forms`: An HTML DOM element or array of such, or a String
- `eventName`: A String defining the name of the event to track or a function that returns it after being passed the form
- `properties`: [Optional] An object of properties, or a function that returns an object, after being passed the form

```js
//form can be:
// - an HTML Form Element
// - an array of form elements
// - a String
// i.e. document.getElementsByTagName('form');

// Static forms capture. Need to call again if forms are added after the fact.
// and be careful not to attach handlers to the same forms twice or they will be double submitted
var forms = document.querySelector("form");

//By default we auto-serialize the form properties; See below how to change what's being sent;
Hull.trackForm(forms, "Form Submitted");

//Dynamic form handling, will capture forms created in Single Page Apps, even if they're created after we call this function.
Hull.trackForm("form.trackable", "Form Submitted");

//You can pass a static object if you want.
Hull.trackForm("form.trackable", "Form Submitted", { property: 'foo' });

// You can specify a function for both the Event and the properties to be generated in a custom way.
Hull.trackForm("form.trackable", function event(form, serialized) {
  // Your custom logic to extract form Name
  return "Form Submitted"
}, function properties(form, serialized) {
  //serialized is a pre-serialized version of the form. You can return it as is, or transform it.
  return serialized;
});

// You can use your own custom logic to extract form properties
Hull.trackForm("form.trackable", function event(form, serialized) {
  return "Form Submitted"
}, function properties(form, serialized) {
  var props = {};
  //Simple, naive form serialization. You probably want to define how to capture data more accurately;
  Array.prototype.slice.call(form.elements).map(function(element){
    // No need to capture the Submit button in the form;
    if (element.type==="submit"){ return; }
    props[element.name] = element.value;
  })
  return props;
})
```

# Querystring Tracking

Hull.js can trigger tracking and traits calls based on what you pass in the URL querystring. This helps tracking email clickthroughs and social media clicks, and ads for instance.


### Here are the parameters you can use:

Parameter | Description | Action
-----------|-------------|----------
`hjs_email`| The email to set for the user.	| This will tell Hull update the user's email to this value, **only if no email was set before**
`hjs_aid`| The anonymousId to set for the user.	| This will tell Hull to alias this value for as an `anonymousId`.
`hjs_attr_<attribute_name>` |	An attribute to pass to the traits call | Triggers a `traits` call with this attribute
`hjs_event`	| The event name to pass to a track call.	| This will trigger a track call.
`hjs_prop_<property>`	| A property to pass to the tracking call	| Doesn't trigger the call in itself, just sets properties that will be embedded in the event you passed with `hjs_event`
So for example, with this URL:

http://test.com/?hjs_event=Clicked%20Email&hjs_aid=fooBar1234&hjs_prop_emailCampaign=ABM+Campaign&hjs_attr_name=Elon+Musk.
it would trigger the following events on the page:

```js
Hull.traits({ name: 'Elon Musk' }); //Hull.traits() still supported for legacy purposes
Hull.track('Clicked Email', { 'emailCampaign': 'ABM Campaign' });
Hull.alias('fooBar123');
```
You can pass up to one of each trigger parameter as shown in the example above.

# Cross-Domain Identity Resolution

Hull.js is one of the rare libraries that allows businesses to recognize user activity across their different websites. Once a user has been recognized on one of your websites, the same identifiers will carry on across all your other properties where Hull.js is installed

# Event Bus

The Hull library embeds a message bus to which you can subscribe to be notified of lifecycle events, and emit your own events as needed.

## Subscribe to a message channel

> This method is available immediately at launch

```js
Hull.on('hull.init', function(hull, me, app, org) {});
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
`hull.track`        | `Hull.track()` called. | `properties`
`hull.traits`     | `Hull.traits()` called.  | `event`

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


# Forwarding data to other services

The Hull library offers a simple way to forward data that you capture to other services. To do so, simply subscribe to it's Event Bus and call your other trackers from there:

## Subscribe to a message channel

### `Hull.on(evtName, cb)`
Hull emits predefined events, and conforms to [EventEmitter2](https://github.com/asyncly/EventEmitter2)'s signature.
You subscribe to them with the `Hull.on()` method:

- The current Event name is available in `this.event`
- It is useful to adapt react on Hull's state

> This method is available immediately at launch

```js
Hull.on('hull.ready', function(hull, me, app, org) {});

//Forward events to Intercom
Hull.on('hull.track', function(properties) {
  Intercom('trackEvent', this.event, properties);
  ga('send', this.event);
});

Hull.on('hull.traits', function(attributes) {
  Intercom('update', attributes);
});
```

> __Hint__: You can use wildcards in your event names to register to a class of events, like `hull.*`


### Message list
Event Name | Description | Arguments
-----------|-------------|----------
`hull.ready`         | `hull.js` has finished loading. | `Hull`, `me`, `app`, `org`
`hull.track`         | `Hull.track()` called. | `properties`
`hull.traits`      | `Hull.traits()` called.  | `event`

### Parameters
Parameter | Type | Description
----------|------|-------------
`evtName` | String  | The name of the event to attach to.
`cb`      | Function | The function to be executed when the event is triggered.

## Unsubscribe from a message channel
> This method is available once the app has started.

### `Hull.off(evtName, cb)`
```js
Hull.off('hull.ready',myFunction);
```

### Parameters
Parameter | Type | Description
----------|------|-------------
`evtName`       | String         | The name of the event the function must be detached from.
`cb`            | Function       | The function to be detached from the event.

Unregisters the function from the event. As usual in such cases, it the reference of the function that is important, not its body.
If you want to unregister a listener, take great care to ensure that when you do, you pass the __same memory reference__ than when you registered it.
There is no tool to help you do this, just proper engineering.

### Emit a message through the local event bus

If you're looking for a way to track user data, you should check [`hull.track()`](#events-tracking - `hull.emit` is a way to pass data inside the page for cross-library communication

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
