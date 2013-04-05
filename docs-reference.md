Documentation...

# Hull.js

hull.js is the only file you have to include to enable all the client-side features of Hull.
It allows you to :

* Init your Hull application
* Declare widgets in your page
* Use prepackaged widgets
* Customize the prepackaged widgets
* Create your own widgets
* Perform API requests


## Hull.init(opts)

In order to get your app up and running, you must first call `Hull.init()`.
The `opts` parameter is an Object Literal that accepts the following keys:

* `appId`: The ID of your application. You can find it in the admin.
* `orgUrl`: The associated Hull subdomain in which your application resides.
It can also be found in the admin, in the description of your organization

---

## Structuring your app

### Making apps with widgets ?

* Widgets nesting

### Building your app

#### Working with grunt

If you use Grunt as your build tool, we provide a `grunt-init` task to kickstart
an application. You can get it [here](https://github.com/hull/grunt-init-hull).

#### Working with PHP
#### Working with Ruby

---

## Widgets

### Using Widgets

#### Locate the widget in your page
Start by placing a `<div>` tag wherever you want the widget to be located; consider this tag as a placeholder.

#### Widget sources

Hull can fetch widgets from many places, called sources. By default, Hull knows 2 sources:

* `hull`, which is he location for our [packaged widgets](/docs/widgets/packaged_widgets)
* `default`, which is the default location for your widgets, has for value `./widgets`. This means that if your baseURL is `/path/to/my/app`,
then the default source intends to find its widgets into `/path/to/my/app/widgets`.

By configuring Hull at startup, you can override these settings (except from the `hull` source) and add any source you want.

Using sources can be very useful if you add 3rd-party widgets, or want to separate your widgets by concerns.

Widgets from a source are namespaced, meaning that you can have 2 widgets with the same name, as long as they don't come from the same source.

#### Specifying the widget type

Use the data-attribute `data-hull-widget` to specify which widget has to be instantiated.

    <div data-hull-widget="my_widget"></div>

Note that this notation is the implicit notation for using the widget source "default".
Below is the explicit version:

    <div data-hull-widget="my_widget@default"></div>


#### Passing parameters

Many widgets can be configured to customize their behaviour. Configuration is passed through `data-hull` attributes.

To pass two parameters `key` and `secret` to a widget `auth`, you must type as follows:

    <div data-hull-widget="auth" data-hull-key="KEY_VALUE" data-hull-secret="SECRET_VALUE"></div>

Now, you can get access to those parmeters in your auth widget:

    this.options.key; // "KEY_VALUE"
    this.options.secret; // "SECRET_VALUE"

#### Using prepackaged widgets

Hull comes packaged with a [bunch of widgets](/docs/widgets/hull_widgets), all you need to do
is add a couple of data-attributes to your HTML document.

#### Creating your own widgets


##### File structure

In Hull, as in [Aura](http://github.com/aurajs/aura), there's a golden rule stating that:

* At the filesystem level, each widget must be placed in its own folder.
* The name of the folder is used as the name of the widget.

By default, in Hull, widgets are looked after in a folder called `widgets`, but you can change this.
See the [Configuration](/docs/Hull.js/configuration) page for details on how to change the default behaviour and add more entry points for your widgets.

Every child subfolder of `widgets` is the description of a folder. The contents of a widget folder should be as follows:

* A `main.js` file that will bootstrap and describe the widgets, specifying its templates, dependencies and overall behaviour. This file is mandatory, no matter how small it can be.
* One or many template files, in the form of \*.hbs files. These files will be referenced by `main.js`.
* Assets, dependencies, pretty much anything that would be necessary to the widget and only to the widget.

A basic widget could have this file structure:

    /
    |-/widgets
    |---/foo
    |-----main.js
    |-----foo.hbs
    |-----bar.hbs
    |-----image.png

<a name="#widgets_sources"></a>

##### (Optional) Declaring sources

Declaring a new source is made during the initialization process of `hull.js`, as part of its [configuration](/docs/Hull.js/configuration)

##### Creating the widget

Let's say you want to create a widget named `awesome`.

To create this widget, make sure:

* You've configured your widgets sources (or use the default one, see the previous section for details)
* You've created a folder named `awesome` in one of your widgets sources.

Then, create a file called `main.js` with the following contents:

<pre class='language-javascript'><code>Hull.widget('awesome', {
  datasources: {},
  templates: [],
  initialize: function () {},
  beforeRender: function (data) {},
  afterRender: function () {},
  /* append your own widgets methods */
});</code></pre>

That's it, you've created a widget. All right, it's not exactly useful nor awsome as it is, but that's pretty much it.
You could even have skipped all the contents of the Object literal and be good to go.

### Initialization & Options

__Is that about the declaration in the DOM or the initialize function ?__

### Backbone Models & Collections ?

### Datasources

Having a good understanding of what they are and what you can do with them will help you leverage the performances and features of your widgets and applications.

Basically, datasources are in charge of communicating with Hull's server APIs and the services attached to your application (Twitter, Facebook...).
We made it easy to get datasources into your widgets, through the property `datasources`.

#### Syntax Overview

As a reminder, you create a widgets with the following syntax:

<pre class='language-javascript'><code>Hull.widget("my_awesome_widget", {
  "datasources": {

    friends: "/me/friends",

    // Alternatively, object an object literal
    facebook_friends: {
      "provider": "facebook",
      "path": ":id/friends"
    },

    // Or, use a function
    dat_song: function () {
      return [
        "Hey, I just met you",
        "And this is crazy",
        "But here's my number",
        "So call me maybe"
      ];
    }

  }

  /\* ...other properties... \*/
});</code></pre>

Using the String notation of the datasource declaration:

* The data-provider will be `hull`,
* You can pass parameters
* Data will be mapped to Backbone.Collection

Using the Object notation:

* You can do everything you could from the String notation
* You can specify the provider,
* You can tell whether to map to Backbone.Collection or Backbone.Model

Using the Function notation:

* You can do everything you could with the Object notation, using `this.api` calls
* You can use static data as a datasource

Beware that when using the Function notation, the function MUST return a promise if the data is not available right away.
If it doesn't return a promise and the data is not there yet, the template may be rendered without the actual data!

Returning a promise solves this all.
If your function returns data that is available immediately, then you can just return the data as is.

#### Providers

The data you'll manipulate in your Hull app can come from many services, which we call providers:

* `hull`, where you can fetch all the user's data (custom user data, app comments, files, reviews, ratings, achievements...)
* `facebook`, where you can retrieve Facebook-specific data

<!-- * `twitter`, where you can retrieve Twitter-specific data -->

When declaring a datasource as a string, you use the default provider, which is `hull`.

You can specify the provider by using the object notation (see example above) and adding a key-value pair with the key `provider`.

#### Default datasources

Hull automatically provides each widgets with 3 default datasources:

* `/me`: your Hull profile, and the associated profile in attached services, if any and if connected to them
* `/app`: the App object in Hull. To this object, you can bind app-wide data, such as files, comments...
* `/org`: featured just as `app`, but related to the organization. It allows you to read/write organization-wide data, which data will be shared among the apps of the same organizations!

#### Parameters

You can use parameters inside your datasources strings.
They follow the standard convention `:param_name`.

For example, you can do :

      <div data-hull-widget="my_widget" data-hull-param="value"></div>

and in your datasources :

      "/:param/likes"

Then, `:param` part will be replaced by `value` in the request.


The name of a parameter can be either:

* a property of the widget instance (`this.param_name`)
* an option passed to the widget through a `data-hull` attribute (`<div data-hull-widget="my_widget" data-hull-param-name="param_value"></div>`)


Default datasources (me, app, org)

### Render flow / widget lifecycle

* datasources hydratation


#### Resolving data

When a widget is instantiated, all the datasources declared in the configuration start being resolved.
When all the datasources are resolved, the data that has been fetched is attached to the widget as properties to `this.datasources`.

In a widget, all the data is fetched asynchronously. Once done, all it is stored in a member of the instance of the widget:
`data`. You can access the data necessary to your widget from anywhere in your widget by reading (or writing dependeing on the needs) `this.data`.

The value of `this.data` is an object literal where each key is a key in the `datasources` object, and the associated value is the data that has been
resolved from the source of data.

* beforeRender

When `this.beforeRender(data)` is called, `data` is an object containing (among other) all the properties of `this.data`.
it is very useful if you have to manipulate the data furthe more before it is bound to the context of the template.

If you return a promise at the end of `beforeRender`, Hull will wait for this promise to be resolved before rendering.

* afterRender
* renderError

### Actions

####Events

You can attach events to the markup of your widgets by using the Backbone DOM events syntax.

Declare the events in your widgets within the 'events' property in your widget.

#### Registering action handlers

Axtions represent an easy way to perform on click actions
The `actions` property of a widget is a hash which keys are the names of the actions you want to trigger and values are methods that you want to be executed on click.
Below is an example of how you could use it, Actions are accessible directly using the following syntax :

<pre class='language-javascript'><code>actions:{
  submit:  function(element, event, data){
    //data = { force : true }
  },
  replay:  function(element, event, data){
  },
  send: function(element, event, data){
  }
}</code></pre>

#### Using actions in your markup

    <a data-hull-action="submit" data-hull-force="true">Submit game</a>

### Widget Methods Reference

initialize

The `initialize` method is used to bootstrap your widget. You should basically consider it as a constructor. Whatever needs to be setup straight after the widget has been created (_created_, not _rendered_; rendering happens later)
happens here. Basically, this is where you will setup the events, private vars/objects, that kind of stuff.

renderTemplate

beforeRender

log (deprecated)

buildContext (private)

loggedIn

`loggedIn` returns `false` if no user is connected to one of the providers you accept in your application.
Otherwise, it returns a hash containing the identities in all the network your user is known to have in your app.

getTemplate



doRender

afterRender

Allows you to do operations after the template has been rendered.
Useful if you want to attach events to newly added elements.

This method takes no parameters and has no return value.

render

You can call `this.render()` in any method in the widget to refresh the view. But you can specify 2 very useful parameters:

* ``templateName`` {String} as the first argument will specify which of the template of the widget has to be rendered. Very useful for widgets with multiple views.
* ``data`` {Object} as a second argument will add/override any data computed by the datasources and the `beforeRender` method.

html

track

allows you to track user activity and send data to the tracking services defined in the [admin](http://alpha.hullapp.io).
    See [Tracking](/docs/Hull.js/tracking) for details

isInitialized

renderError

api

allows to do API calls directly. The methods systematically returns a promise. See [Accessing Data](/docs/Hull.js/accessing_data)
    to know how to perform these actions.

refresh

refresh is an alias for render

el / $el

is a cached jQuery element representing the root node of the widget

### Sandbox Reference

config

logger

helpers
	imageUrl

authenticating
login
logout

emit
off
on
stopListening

track


### Debugging

logging / debug mode

renderError method

### Events

refreshEvents


### Templates & Available helpers

---

## Events

### Native events emitted by hull.js

ex.

* hull.currentUser
* model.hull.me.change
* hull.authComplete

### Events emitted by packaged widgets

### Emitting and consuming custom Events

---

## Available vendored libs

* aurajs
* requirejs
* underscore
* underscore.string
* handlebars
* backbone
* cookies
* moment
* base64


---

## Hull's APIs

### Hull API

### Services APIs

---

## Authentication Guide

### login / logout and cross-domain sso

* Hull.login / sandbox.login
* Hull.logout / sandbox.logout

### Provider permissions

---

## Tracking

The tracking middleware sends data to hull automatically.
In the admin panel, you can configure the services to which send this data (Google Analytics, Mixpanel...).
We also store everything for further applications.

<pre class='language-javascript'><code>Hull.track('event name', { foo:'bar', arbitrary:'data' });</code></pre>

**Widgets automatically do this behind the scenes.**

---

## Packaged widgets

---



# Hull APIs

* Document formats
* Explain concepts

