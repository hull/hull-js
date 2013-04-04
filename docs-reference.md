Documentation...

# Hull.js


## Hull.init

---

## Structuring your app

### Making apps with widgets ?

* Widgets nesting

### Building your app

#### Working with grunt
#### Working with PHP
#### Working with Ruby

---

## Widgets

### Using packaged widgets vs creating your own

Mention WidgetSources

### Initialization & Options

### Backbone Models & Collections ?

### Datasources

Default datasources (me, app, org)

### Render flow / widget lifecycle

* datasources hydratation
* beforeRender
* afterRender
* renderError

### Actions

events (Backbone DOM events cf. Actions)

Registering action handlers

Using actions in your markup


### Widget Methods Reference

initialize

renderTemplate

beforeRender

log (deprecated)

buildContext (private)

loggedIn

getTemplate

doRender

afterRender

render

html

track

isInitialized

renderError

api

refresh

el / $el


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

---

## Packaged widgets

---



# Hull APIs

* Document formats
* Explain concepts

