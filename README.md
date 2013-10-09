# Hull.js [ ![Codeship Status for hull/hull-js](https://circleci.com/gh/hull/hull-js/tree/develop.png?circle-token=26a17dad6ac378f6028a460a5857d5ca15a8aa13) ](https://circleci.com/gh/hull/hull-js)

# Building the library

Checkout

    git@github.com:hull/hull-js.git

First, install grunt and bower

    sudo npm install -g grunt-cli

Then switch to hull-js dir

    cd hull-js
    npm install
    grunt

The last command will start a static HTTP server (port `3001`) that serves the files located in
the root folder.

## Using the boilerplate app

A boilerplate app is located in the `app` folder. Here's how to use it:

```
cp app/app.example.js app/app.js
grunt
open http://localhost:3001/app
```

__Note__: You must configure `app/app.js` with the settings of your app,
as found in your account at [https://hullapp.io](https://hullapp.io).


# Main `grunt` tasks

* `dist`: Builds and executes the tests
* `server` (default task): `dist` + starts a static HTTP server for local use
* `deploy`: `dist` + [Additional flavors](http://hull.io/docs/hull_js/#flavors) + S3 upload (see below)

# Deploying to S3 :

We use S3 internally. A grunt task to deploy in S3 is provided.
If you want to deploy to S3 too, follow these instructions:

Create the file `.grunt/grunt-aws.json`, with the following content :

    {
      "key":"YOUR_AWS_KEY",
      "secret":"YOUR_AWS_SECRET",
      "bucket":"YOUR_AWS_BUCKET" // Without the "s3.amazonaws.com" part
    }


# Developing locally (force @hull components to be fetched locally)

    <script src="http://localhost/dist/%%CURRENT_VERSION%%/hull.js"></script>
    <script>
      Hull.init({
        appId: 'YOUR_APP_ID',
        orgUrl: 'YOUR_APP_ID',
        jsUrl: 'http://localhost/dist'
      });
    </script>


# Contributing

You're encouraged to submit pull requests,
propose features and [discuss issues](http://github.com/hull/hull.js/issues).

If you want to submit code:

* Fork the project
* Write tests for your new feature or a test that reproduces a bug
* Implement your feature or make a bug fix
* Commit, push and make a pull request. Bonus points for topic branches.


##Components

If you want to contribute components to hull in [the marketplace](http://hull.io/marketplace),
please provide documentation for you components with the following syntax.
The human-readable version of the documentation will be auto-generated
when your coponent is integrated in the marketplace.

### Component Description Template:

```javascript
/**
 *
 * Description
 *
 * # MANDATORY
 * @name Component Name
 * @param {String} optionName Optional/Required. Option description
 * @example <div data-hull-component="login/button@hull"></div>
 * # OPTIONAL
 * @template {template_name} template_description
 * @datasource {activities} The activity stream that will be displayed.
 * @action {achieve} Achieve the achievement with the entered secret
 * @your_custom_tag {name} value
 * @your_custom_tag value
 */
 */
```

As an example

```
/**
 * View a conversation's messages and allow users to reply to the thread.
 *
 * @name NAME
 * @param {String} id Required The conversation object - This must a conversation ID. Use the '/UID/conversations' api call to get conversation IDs for an entity or hull object.
 * @param {Boolean} focus Optional Focus after render
 * @datasource {conversations} A conversation
 * @template {thread} The main template, that show conversation's messages, participants and form
 * @template {form} A form that allow logged user to add messages to the conversation
 * @template {participants} List of the conversation's participants
 * @example <div data-hull-component="conversations/thread@hull" data-hull-id="OBJECT_ID"></div>
 */
```


# License

MIT License. See LICENSE for details.

# Copyright

Copyright (c) 2013 Hull, Inc.
