# Installing `hull.js`

`hull.js` is the library that enables all the client-side features of Hull.

How you can get `hull.js`:

* download it from [your admin page][admin]
* Include it from our CDN. The URL is indicated in [your admin page][admin]
* Build it from [the source](http://github.com/hull/hull-js) (instructions included)

Once you've got it, install it as follows:

1. Add `jQuery` (or `Zepto`) to your app (__Untested with jQuery 2.0 beta__) as well as `hull.js`

        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
        <script src="PATH/TO/hull.js"></script>

# Initialize your application

In order to get your app up and running, you must first call `Hull.init()`.
The `opts` parameter is an Object Literal that accepts the following keys:

* `appId`: The ID of your application. You can find it in [the admin][admin].
* `orgUrl`: The associated Hull subdomain in which your application resides.
It can also be found in [the admin][admin], in the description of your organization.
* `debug`: a Boolean flag for your app to output a bunch of logs in the console.
* `components`: Declares your components sources. See [the relevant section to use components sources]() for details.

As a minimal setup, you should type the following:

    Hull.init({
      appId: "YOUR_APP_ID",
      orgUrl: "YOUR_ORGANIZATION_URL"
    });

Where `YOUR_APP_ID` and `YOUR_ORGANIZATION_URL` are as defined in [the administration][admin].

The next section will cover the basics of using components in Hull.
Although Hull provides you direct access to its API, best luck is that you will
want to give components a try, to eventually build some by yourself for more reusability!

# Getting started with components

As a starter, we'll show you how to make use of the prepackaged components.
All the concepts outlined in this section will still be valid when you'll come to create your own components.

## Using prepackaged components

Hull comes packaged with a [bunch of components](/docs/components/hull_components), all you need to do to start a component
is add a tag to your page alongside a couple of data-attributes.

In this section, we will use the `identity` component as an example. It allows your users to log
in using any of the social networks your app is bound to (see [the admin][admin] for binding authentication services to your app).

### Locate the component in your page

Start by placing a `<div>` tag wherever you want the component to be located; consider this tag as a placeholder for the rendered component.

    <div></div>

This component will be rendered __inside__ this element. You don't have to use a div,
feel free to use the appropriate HTML tag.

### Specifying the component type

Use the data-attribute `data-hull-component` to specify which component has to be instantiated.
In this case where we want to use the `identity` component, we will write:

    <div data-hull-component="identity@hull"></div>

Note the `@hull` notation. Hull provide means to use components from various locations,
which we call _component sources_, and all the prepackaged components come from the `hull` source.

You can [learn more about component sources below]().

### Look 'Ma, it's working!

That's all that is required to have a fully functional login component... Really. Refresh your page to see the results.

To summarize things up:

1. Insert `hull.js` in your page
2. Add the necessary markup for your components
3. Execute `Hull.init(opts)` with your credentials

**That's enough to run the components, but you may still want to go a litle further. Here's an excerpt of what you can do more:**

<a href="#" id="passing_parameters"></a>
### Passing parameters to a component

Most of the time, you will need to customize the behaviour of your components.
In Hull, you can pass options to your components by using `data-hull-` attributes,
just like you would pass arguments to a method.

Following our example, the `identity` component accepts one `provider` parameter, so you can choose
the authentication provider you want your users to connect with.

Tell the component you want to use only Twitter OAuth as a valid uthentication method by typing:

    <div data-hull-component="identity@hull" data-hull-provider="twitter"></div>

Of course, if a component requires more options, declare as many `data-hull-` options
as necessary.

All the options that you pass using `data-hull-` attributes are available in the instance of your component under `this.options`.

As an example, if you have used:

    <div data-hull-eidget="myComponent" data-hull-foo="FOO" data-hull-bar="BAR">

You can access the options in the component's instance as:

    this.options.foo; // corresponds to `data-hull-foo` attribute
    this.options.bar; // corresponds to `data-hull-bar` attribute

Some remarks regarding the `identity` component:

* We have many providers available, you can find them all from the admin, under the
`authentication services` page.
* Having registered at least one provider is required in your Hull app if you want to use authentication.
* If you don't provide a `data-hull-provider` to the component, users will be able to authenticate to the provider they prefer in the list
of the services attached to your app.

### Overriding templates

Our prepackaged components come with some default markup, fit to work natively with [Twitter Bootstrap](http://twitter.github.com/bootstrap).
However, it may not fit your design and if you ever want to customize the rendering of the template, [many options are available](#overriding_templates).

We will see in this section the fastest (yet not the most optimized) way to do so.

To override a template in Hull, it is enough to add a `<script>` tag to your page like the following:

    <script type="text/x-template" data-hull-template="identity/identity">
      {{if loggedIn}}

        Hello {{name}}, how are you since the last time we met?

      {{else}}

        I don't know you, but I already like you!
        <button data-hull-action="login">Login here</button>

      {{/if}}
    </script>

`hull.js` uses Handlebars, if you're not familiar with the syntax, check out the [official documentation](http://handlebarsjs.com/).

There are a few things to be noticed here:

* `loggedIn` is a method bound to the context of the template. it returns false if no user is connected, a truthy value [see details](#) otherwise.
* The user itself is bound to the context of the template, that's what makes {{name}} available.
* Look at the `data-hull-action` attribute in the login button. `data-hull-action` represent special `click` handlers. Learn more [here]().

#### Meteor

Meteor compiles to a global named `Template`. Populate it with your templates by
using the `<template>` tag.

```
<template name="component/template">
  Hello {{me.name}}
</template>
```

### More about prepackaged components

Now you can already start adding social features in your app or even build a complete 100% social app with Hull!
To know everything about our prepackaged components, refer to the [components reference]().

## Creating your own components

### File structure

In Hull, there's a golden rule abut components coming from [Aura](#architecture) stating that:

* At the filesystem level, each component must be placed in its own folder.
* The name of the folder is used as the name of the component.

By default, in Hull, components are looked after in a folder called `components`, but you can obviously change this.
See the [Configuration](/docs/Hull.js/configuration) page for details on how to change the default behaviour and add more _component sources_ for your components.

Every subfolder of `components` is the description of a component. The contents of a component folder should be as follows:

* A `main.js` file that will bootstrap and describe the components, specifying its templates, dependencies and overall behaviour. This file is mandatory, no matter how small it can be.
* One or many template files, in the form of \*.hbs files. These files will be referenced by `main.js`.
* Assets, dependencies, pretty much anything that would be necessary to the component and only to the component.

A basic component could have this file structure:

    /
    |-/aura_components
    |---/foo
    |-----main.js
    |-----foo.hbs
    |-----bar.hbs
    |-----image.png

<a name="#components_sources"></a>
### Component sources

Hull can fetch components from many places, called _component sources_. By default, Hull knows 2 sources:

* `hull`, which is he location for our [packaged components](/docs/components/packaged_components)
* `default`, which is the default location for your components, has for default value `./components`. This means that if your baseURL is `/path/to/my/app`,
then the default source intends to find its components into `/path/to/my/app/components`.

By configuring Hull at startup, you can override these settings (except from the `hull` source) and add as many sources you want.

Using sources can be very useful if you add 3rd-party components, or want to separate your components by concerns.

Components from a source are namespaced, meaning that you can have 2 components with the same name, as long as they don't come from the same source.

Declaring a new source is made during the initialization process of `hull.js`, as part of its [configuration](/docs/Hull.js/configuration).

### Coding the empty component

Let's say you want to create a component named `awesome`.

To create this component, make sure:

* You've configured your components sources (or use the default one, see the previous section for details)
* You've created a folder named `awesome` in one of your components sources.

Then, create a file called `main.js` with the following contents:

    Hull.component('awesome', {
      datasources: {},
      templates: [],
      initialize: function () {},
      beforeRender: function (data) {},
      afterRender: function () {},
      /* append your own components methods */
    });

That's it, you've created a component. Alright, it's not exactly useful nor awsome as it is (as it doeas does strictly _nothing_), but that's pretty much it.
You could even have skipped all the contents of the Object literal and be good to go.

### Add some features

To know what to do with each of these properties and what to expect from them, please refer to the [Component API](#component_api)

# Hull.js technical reference

## Datasources

Having a good understanding of what they are and what you can do with them will help you leverage the performances and features of your components and applications.

Basically, datasources are in charge of communicating with Hull's server APIs and the services attached to your application (Twitter, Facebook...).
We made it easy to get datasources into your components, through the property `datasources`.

### Syntax Overview

As a reminder, you create a components with the following syntax:

<pre class='language-javascript'><code>Hull.component("my_awesome_component", {
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

### Providers

The data you'll manipulate in your Hull app can come from many services, which we call providers:

* `hull`, where you can fetch all the user's data (custom user data, app comments, files, reviews, ratings, achievements...)
* `facebook`, where you can retrieve Facebook-specific data

<!-- * `twitter`, where you can retrieve Twitter-specific data -->

When declaring a datasource as a string, you use the default provider, which is `hull`.

You can specify the provider by using the object notation (see example above) and adding a key-value pair with the key `provider`.

### Default datasources

Hull automatically provides each components with 3 default datasources:

* `/me`: your Hull profile, and the associated profile in attached services, if any and if the user is logged in
* `/app`: the App object in Hull. To this object, you can bind app-wide data, such as files, comments...
* `/org`: featured just as `app`, but related to the organization. It allows you to read/write organization-wide data, which data will be shared among the apps of the same organizations!

### Parameters

You can use parameters inside your datasources strings.
They follow the standard convention `:param_name`.

The parameter of the datasource will be resolved by looking up properties in the folowing order:

* a property of the component instance (`this.param_name`)
* a key in the `options` hash of the component (`this.options.param_name`)

The latter means that you can pass options to your datasources directly from `data-hull-` attributes.
This is very useful to component nesting and dynamic component instantiation.
See [Passing parameters](passing_parameters) for details.

## Render flow / component lifecycle

### Component initialization

Components are instantiated lazily, which means they will be created only when there is in the app an HTML tag
with a `data-hull-component` attribute which value can be resolved to a component definition.

After some internal work on the definition provided in `main.js` (extension of the Javascript base prototype of Component, mainly),
an instance of the component is created, starting the following tasks:

* The datasources are being resolved asynchronously
* The templates are being resolved asynchronously
* the `initialize` method is called.

__This method is the first entry point for developers where they can customize the behaviour of the component.__
Due to the async nature of datasource and template resolutions, it is very hazardous to consider them as available during the execution
of thr `initialize` method.

### Datasources resolution

When a component is instantiated, all the datasources declared in the configuration start being resolved.
When all the datasources are resolved, the data that has been fetched is bound to the component as properties to `this.data`.

Every key in `this.datasources` (which dt)is the container of datasources definition) will eventually have a corresponding key in `this.data`.
Whereas the former is the container of datasources definitions, the latter contains the _actual_ data that has been fetched.

The values in `this.data` are Object Literal.

### Data manipulation

When all the datasources have been resolved to actual data, the method `beforeRender` is called. The method takes one parameter
that is an Object Literal containing (among other) all the properties of `this.data`.
it is very useful if you have to manipulate the data further more before it is bound to the context of the template.

Every property you may addi or modify to this object will be bound to the context of the template and usable in it.

If you return a promise at the end of `beforeRender`, Hull will wait for this promise to be resolved before rendering and will bind
the resolved value to the context of the template.

In beforeRender, you can also optionnally define which template will be rendered by setting a value to `this.template`.
The value __MUST__ be one of the elements in `this.templates`.

If no template has been explicitely defined (by setting a value in `this.template`), then the first element of the array in `this.templates` will be rendered.

### Rendering

At this point, the template has been selected, either by default or explicitely, and the data has been fetched and manipulated if needed.
A few properties are added added to the context of the template before the actual rendering:

* loggedIn: true if the current user is logged in with one of the authentication services if the application.
* me: The identity of the loggedIn user. Contains all the informations useful to identify the user.

These two entries can be used whenever you want to do personnalized output or when your template has to be rendered conditionnally depending
on the connectedness of the user.

If at any time a rendering error occurs, the method renderError will be called, allowing developers to act upon rendering errors.

### Post-rendering

When the component has been rendered, the method `afterRender` is executed, for the developer to be able to act upon the data as well as the markup.
This may be used to add custom listeers to DOM events, or bind data to specific DOM nods.

<a href="#" id="overriding_templates"></a>
## Overriding templates

Hull's packaged components come with their own templates, that you can override.
We chose [Handlebars](http://handlebarsjs.com/) because it is fast and powerful.
We provide a bunch of ways to customize and override the templates.

__The next sections applies for the packaged components, but also for your custom templates.__

<a name="template_names"></a>
### Namimg templates

First things first, if you want to write or override a template, you must know how they're named.

Following the filesystem structure of a [component](/docs/components/creating components), the full name of a template is

    component_name/component_template

As an example, in a component named `foo`, if you have 2 templates named `bar` and `baz`, the names of the two templates will be:

    foo/bar
    foo/baz

Now you know how to naming is done, let's see how to actually override templates.

### Simple version : In-page overrides

You can override a template by creating a `<script>` tag in your page with its name in the data attribute `data-hull-template`:

    <script type='text/x-template' data-hull-template='WIDGET_NAME/TEMPLATE_NAME'>
      ... Your Template here
    </script>

where `WIDGET_NAME/TEMPLATE_NAME` is as described in the previous section.

### Overriding templates in Hull.templates

Another (cleaner, to be honest) way is to store your templates in `Hull.templates`.
It is a Javascript Object literal, in which the keys are the templates IDs, and the values are the templates themselves.

As an example, to override the template `foo/bar` (Remember: it's the template `bar` of the component `foo`), just do the following:

    Hull.templates["foo/bar"] = "You are awesome, {{name}}!";


If you have already precompiled [Handlebars](http://handlebarsjs.com) templates, you can use them as the values for the entries of `Hull.templates`.

**Please note**: This is the actual way that we use to include the templates for the packaged components.

## User interaction

The purpose of a component is present data to the user so he can interact with it.
To fulfill this purpose, `hull.js` exposes an easy interface to catch user-generated events.

### Actions

In your components, you can use the `actions` property to simply define custom click handlers.
The `actions` property of a component is a hash which keys are the names of the actions
you want to trigger and values are methods that you want to be executed on click.

Here's an example of how you do it:

    Hull.component('naiveABTestingComponent', {
      "templates": ['main' 'signupFormA', 'signupFormB'],
      "actions": {
        /**
         * When the action is triggered, this action renders randomly
         * one of the two templates of the component
         * @param {jQuery} elt The DOM element on which the action has been triggered
         * @param {Object} evt The event that has been triggered
         * @param {Object} data The data associated with the element (specified by data-hull-* attributes)
         */
        abTest: function (elt, evt, data) {
          var rnd = Math.round(Math.random());
          this.render(rnd ? 'signupFormA', 'signupFormB');
        }
      }
    });

The above snippet indicates what needs to be done, now we have to indicate our components _when_
the action needs to be triggered. This happens in the template, using a simple `data-hull-action` attribute.

    <a href="#" data-hull-action="abTest">Signup</a>

Whenever the user clicks the Signup link, the `abTest` action is triggered.

__Note on event bubbling__: Remember that events bubble! If you don't call `evt.stopPropagation()`, the action will
 bubble up to the DOM root. If this component is contained in another Hull component,
its parent will throw an error if it doesn't have an `abTest` action defined.

__Note on default actions__: If you bind actions to elements that have default actions, like `<a>`,`<input>`
or `<button>`, you __MUST__ call `evt.preventDefault()` if you require that the default action
is not executed.

## Event-driven communication

As all the components are meant to be independent and have as little dependencies as possible,
the communication between components and between a component and the core of `hull.js` happens through events,
thanks to a global mediator.

### Using events to refresh the component

Following [Backbone][backbone] conventions, we have provided `hull.js` with a mechanism to
automatically refresh components (on demand) when a specific event occurs.
These events can be setup in the `refreshEvents` property of a component.

    Hull.component('customEventsExample', {
      "refreshEvents": ['my.events.custom1'],
    });

In this example, the component will subscribe to the event `my.events.custom1` and perform a refresh
on the currently active template when the event is triggered.

`hull.js` comes a set of predefined events:

* `model.hull.me.change` is triggered when the current user has any of his properties updated.
* `hull.auth.complete` is triggered when the user has logged in.
* `hull.auth.failure` is triggered when the user has failed to log in.

### Global event communication

Every instance of components have a bunch of method for generating events:

#### this.emit(eventName, data);

This method initiates a message that is dispatched through the mediator to the subscribers.

* `eventName` {String}: The name of the event to be dispatched
* `data` {mixed} Data that will be passed to the subscribers

#### this.on(eventName, cb)

* `eventName` {String} The name of the event to register to
* `cb` {Function} The function to be called when the event is triggered.

    The callback will receive the data sent by `emit` (if any) as its first parameter.


#### this.off(eventName)

This method cancels the subscription to the event specified in parameter.

* `eventName` {String}: The name of the event

<a href="#" id="component_api"></a>
## Component API Reference

### Component Properties

#### options

A hash of properties for the component. These options will be overridden by `data-hull-` attributes

#### template

The name of the template that will be rendered at the next call to `this.render()`.
This will be overridden if `this.render` is called with a template name as its first argument.
The value of `template` __must__ be one of the values of the `templates` array at the declaration of the component.

#### datasources

The definition of the datasources used by the component. See [The relevant section](#datasources) for details.

#### $el

A jQuery element representing the root node of the component.

#### sandbox

The instance of the sandbox for the current component. See [the sandbox reference](sandbox) for details.

#### isInitialized

A boolean value indicating if the component has finished being initialized. Useful if you register to events and they trigger before the component is done initializing.

### Components Methods

#### initialize()

The `initialize` method is used to bootstrap your component. You should basically consider it as a constructor. Whatever needs to be setup straight after the component has been created (_created_, not _rendered_; rendering happens later)
happens here. Basically, this is where you will setup the events, private vars/objects, that kind of stuff.

#### renderTemplate(tplName, data)

* __tplName__ {String} The identifier of the template you want to compile
* __data__ {Object} The data to be passed to the template engine. It will be used to define the context of the component

The method returns the __String__ of HTML corresponding to the compiled template.

#### beforeRender(data)

* __data__ {Object} The prebuilt context

This method can be safely overridden. Its purpose is to allow the developpers to add data to the context that will be passed to the templating engine.

If the method returns an object, this object will be used as the context for the template. If the method returns a promise,
the resolved value of the promise will be used as the context.

#### log(msg) [deprecated]

* __msg__ {mixed} the data to be logged

Displays a mesage in the console of the browser. The message that is given is parameter will be prepended in the console with contextual information.

#### buildContext() [private]

This method builds the context before rendering the template. It sets up the vaious promises that are to be resolved (data, template loading),
and returns a Deferred so that everything is wired up correctly.

__Note__: This method, although public, is not supposed to be used by developers.

#### loggedIn()

`loggedIn` returns `false` if no user is connected to one of the providers you accept in your application.
Otherwise, it returns a hash containing the identities your user is known to have in your app for every network you have setup.

#### getTemplate()

Returns the current template (the one that will be rendered next time `render` is executed).
By default, it returns the first element of `this.templates`.

#### doRender(tpl, data)

* __tpl__ {String} The name of the template to be used
* __data__ {Object} The data to be used as the template's context

Renders into the root element of the component the specified template and binds some specific data as its context.

#### afterRender(data)

Allows you to do operations after the template has been rendered.
Useful if you want to attach events to newly added elements.

This method takes no parameters and has no return value.

#### render(optTpl)

You can call `this.render()` in any method in the component to refresh the view. But you can specify 2 very useful parameters:

* __templateName__ {String} as the first argument will specify which of the template of the component has to be rendered. Very useful for components with multiple views.
* __data__ {Object} as a second argument will add/override any data computed by the datasources and the `beforeRender` method.

#### track(name, data)

* __name__ {String} The tracking event name that will be used in the tracking services
* __data__ {Object} The data to be associated to the event in the tracking services

Allows you to track user activity on custom events and send data to the tracking services defined in the [admin](http://alpha.hullapp.io).


#### renderError(errMsg, err)

* __errMsg__ {String} The message explaining the error
* __err__ {Error} The complete error

This method is called when one of the operations required prior to the rendering (datasources, template loading) has failed.
You can safely override this method for error management.

#### api(uri, data)

* __uri__ {String} URI to be reached by Hull's API.


Allows to do API calls directly. The methods systematically returns a promise.
See [Hull API](hull_api) to know how to perform these actions.

#### refresh

Refresh is an alias for render

<a href="#" id="sandbox"></a>
### Sandbox Reference

#### config

#### logger

#### helpers
	imageUrl

##### authenticating
##### login
##### logout

##### emit
##### off
##### on
##### stopListening

##### track

## The global variable `Hull`

* Hull.login
* Hull.logout
* Hull.on
* Hull.off
* Hull.emit


## Debugging

logging / debug mode

renderError method

## Templates & Available helpers

## Events emitted by packaged components

<a href="#" id="hull_api"></a>
## Hull API

### Hull native API

Hull offers an unified API to let you query data from Hull or from a third party provider.
All of the API is available from 2 endpoints in the JS library:

* From anywhere in your app: `Hull.data.api()`
* From within a component: `this.api()`

If you wish to access the data from Hull for the current user, just type:

<pre class='language-javascript'><code>Hull.data.api("hull/me", function(account){
    console.log('This is my Hull account data', account);
});</code></pre>

### Embedded thirdparty APIs

If a User authenticates with a third party network (think Facebook Connect, Twitter, Github...), hull will expose this network's data and API.

Actions requiring those network's will automatically ask the user to connect when needed.

You can also use this api to request Facebook data, as an example:

<pre class='language-javascript'><code>Hull.data.api("facebook/me", function(account){
  console.log('This is my facebook account data', account);
});</code></pre>

See the API Reference and Services Reference for details.

## Provider permissions

## Making apps with components ?

### Structuring your app

* Components nesting

### Building your app

### Working with grunt

If you use Grunt as your build tool, we provide a `grunt-init` task to kickstart
an application. You can get it [here](https://github.com/hull/grunt-init-hull).

### Working with PHP
### Working with Ruby

# Tracking

The tracking middleware sends data to hull automatically.
In the admin panel, you can configure the services to which send this data (Google Analytics, Mixpanel...).
We also store everything for further applications.

<pre class='language-javascript'><code>Hull.track('event name', { foo:'bar', arbitrary:'data' });</code></pre>

**Components automatically do this behind the scenes.**

<a href="#" id="architecture"></a>
# Hull architecture

`hull.js` uses and exposes a solid application architecture, ready for use and built with standard and well-known projects.

* [Backbone.js][backbone]
* [Aura](http://github.com/aurajs/aura)
* [Handlebars](http://handlebarsjs.com/)
* [Underscore](http://underscorejs.org)
* [analytics.js](http://github.com/segmentio/analytics.js)
* [moment.js](http://momentjs.com/)
* [jQuery](http://jquery.com/)

You don't have to know any of them to use and build your own components.
We don't require in-depth (if any) knowledge of any of these libraries/frameworks to build your own social application.

### We are dedicated to Open-Source.

We contribute to Open Source projects whenever we feel like we may bring something useful to the table.
We truly think this is the only way to build better software that everybody can take advantage of.

[admin]: https://alpha.hullapp.io
[backbone]: http://backbonejs.org
