# Introduction

`hull.js` lets you track Customer data and recognize users.

It also lets you easily embed certain connectors in the page to inject functionality such as the [Intercom connector](https://hull-intercom.herokuapp.com) or the [Browser Personalization connector](https://hull-browser.herokuapp.com). For this go to the Platform section in your dashboard, and add the relevant connector. It will be added to the page without having to write code.

It is the library you install when you paste a Platform snippet in your page's `HEAD` tag.

# Booting Hull

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

`Hull.ready()` can also be used as a promise like this:

```js
Hull.ready().then(({ hull, me, app, org }) => {
  console.log('All good', me.name)
});
```

> Note than since Promises only resolve the first argument, we return a single object instead of 4 arguments.

#### `Hull.on()`

Register an event listener. See [events](#subscribe-to-an-event)

#### `Hull.track()`

Track something. See [Tracking](#tracking)

#### `Hull.identify()`

Set attributes. See [Attributes](#attributes)

#### `Hull.alias()`

Set an Alias for the current visitor. See [Alias](#alias)



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

### `Hull.config()`

Returns an object containing all information about the current app and user, including keys to services:

# Attributes
You can use attributes to store factual properties, such as "birthdate", "number of connectors" et. al.
Attribute let you segment your customers in the [Dashboard](http://dashboard.hullapp.io)

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
Hull.identify({'my new attribute': 'has this value'});
```

> You can also atomically update a value with some helpers:

```js
Hull.identify({'carrier': {value: 'swallow'}}) //Sets carrier to 'swallow'
Hull.identify({'carrier': {value: 'swallow', operation: 'set'}}) //Equivalent to the above

//Select the operation to apply
Hull.identify({'a_number': {value: 12}}) //Sets the attribute to the integer `12`
Hull.identify({'a_number': {value: 12, operation: 'inc'}}) //The attribute now has the value `24`
Hull.identify({'a_number': {value: 20, operation: 'dec'}}) //The attribute now has the value `4`

//Work with multiple attributes at once
Hull.identify({
  'numberA': {value: 12, operation: 'inc'},
  'numberB': {value: "this is cool"},
});
```

```js
Hull.identify({
  string: "foo",
  fakeNumber: "123", //WILL BE RECOGNIZED AS A STRING
  realNumber: 123 //Will be recognized as a number
})
```
> Be mindful of the difference betwen strings and numbers:


### `Hull.identify({ attribute_name: value })`
Sets the `value` to the attribute of name `attribute_name`.

Once sent, attributes aren't exposed to users anymore.

<aside>
  This method is available immediately at launch
</aside>



# Tracking
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

```js
//form is an HTML Form Element or an array of form elements
// i.e. document.getElementsByTagName('form');

Hull.trackForm(forms, event, [properties]);

Hull.trackForm(forms, "Event Name", { property: 'foo' });

Hull.trackForm(forms, function event(form){
  // Your custom logic to extract form Name
  return <string>
}, function properties(form){
  // Your custom logic to extract form properties
  return <object>
});
```

### `Hull.trackForm(eventName, data)`
Listen to form submissions and  performs a tracking call

- `forms`: An HTML DOM element or array of such. jQuery supported
- `event`: A String defining the name of the event to track or a function that returns it after being passed the form
- `properties`: [Optional] An object of properties, or a function that returns an object, after being passed the form


# Querystring Tracking

Hull.js can trigger tracking and identifys calls based on what you pass in the URL querystring. This helps tracking email clickthroughs and social media clicks, and ads for instance.


### Here are the parameters you can use:

Parameter | Description | Action
-----------|-------------|----------
`hjs_aid`| The anonymousId to set for the user.	| This will tell Hull to alias this value for as an `anonymousId`.
`hjs_attr_<attribute_name>` |	An attribute to pass to the identifys call | Triggers a `identify` call with this attribute
`hjs_event`	| The event name to pass to a track call.	| This will trigger a track call.
`hjs_prop_<property>`	| A property to pass to the tracking call	| Doesn't trigger the call in itself, just sets properties that will be embedded in the event you passed with `hjs_event`
So for example, with this URL:

http://test.com/?hjs_event=Clicked%20Email&hjs_aid=fooBar1234&hjs_prop_emailCampaign=ABM+Campaign&hjs_attr_name=Elon+Musk.
it would trigger the following events on the page:

```js
Hull.identify({ name: 'Elon Musk' });
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
`hull.ships.ready`  | Connectors are loaded.               | nothing
`hull.user.update`  | User updated any property   | `me`
`hull.track`        | `Hull.track()` called. | `properties`
`hull.identify`     | `Hull.identify()` called.  | `event`

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
