# Hull.js [ ![Codeship Status for hull/hull-js](https://circleci.com/gh/hull/hull-js/tree/develop.png?circle-token=26a17dad6ac378f6028a460a5857d5ca15a8aa13) ](https://circleci.com/gh/hull/hull-js)

# Building the library

Checkout

    git@github.com:hull/hull-js.git

First, install grunt and bower

    sudo npm install -g grunt-cli bower

Then switch to hull-js dir

    cd hull-js
    npm install; bower install
    # First install : Build Aura
    cd components/aura ; npm install ; bower install ; grunt build
    cd ../..
    grunt build


Serve it to js.hull.dev via pow

    echo 3001 > ~/.pow/js.hull


Configure ```app/app.js``` with the correct settings


# Using locally

Start grunt

    grunt

Open in your browser

    open http://js.hull.dev

Drink your coffee.


# Deploying to S3 :

Create a `grunt-aws.json` file at the root, with the following content :

    {
      "key":"YOUR_AWS_KEY",
      "secret":"YOUR_AWS_SECRET",
      "bucket":"YOUR_AWS_BUCKET" // Without the "s3.amazonaws.com" part
    }


# Developing locally (force @hull to fetch from js.hull.dev)

    <script src="//hull-js.s3.amazonaws.com/develop/hull.js"></script>
    <script>
      Hull.init({
        appId: 'YOUR_APP_ID',
        orgUrl: 'YOUR_APP_ID',
        jsUrl: 'http://js.hull.dev/dist'
      });
    </script>


# Component Description Template:

```
/**
 * 
 * Description
 *
 * @name Component Name
 * @param {String} optionName Optional/Required. Option description
 * @action {achieve} Achieve the achievement with the entered secret
 * @datasource {activities} The activity stream that will be displayed.
 * @template {template_name} template_description
 * @your_custom_tag {name} value
 * @your_custom_tag value
 * @example <div data-hull-component="login/button@hull"></div>>
 */
```

Example

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
