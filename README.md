# Hull.js [ ![Codeship Status for hull/hull-js](https://circleci.com/gh/hull/hull-js/tree/develop.png?circle-token=26a17dad6ac378f6028a460a5857d5ca15a8aa13) ](https://circleci.com/gh/hull/hull-js)

# Ship Deployment Compatibility Status
[Table](https://docs.google.com/spreadsheets/d/13lwZP8XmhIBA84bpmKd-96nC9nE9tQaM0c0WgyQNHXI/edit#gid=0.8)

| Device      | OS            | Browser           | Version  | HTMLImports | JS mode | Raw Mode | Scoped Mode | Sandboxed Mode | Notes                                                                            |
|-------------|---------------|-------------------|----------|-------------|---------|----------|-------------|----------------|----------------------------------------------------------------------------------|
| Nexus 4     | Android       | Android           | 4.0.0    | OK          |         | OK       | OK          | OK             |                                                                                  |
| Galaxy S3   | Android       | Android           | 4.1      | OK          |         | OK       | OK          | OK             |                                                                                  |
| Nexus S     | Android       | Android           | 4.2.2    | OK          |         | OK       | OK          | NO             |                                                                                  |
| Galaxy S5   | Android       | Android           | 4.4      | OK          |         | OK       | OK          | OK             |                                                                                  |
| Galaxy S4   | Android       | Android           | 4.4      | OK          |         | OK       | OK          | OK             |                                                                                  |
| Nexus 5     | Android       | Android           | 4.4      | OK          |         | OK       | OK          | OK             |                                                                                  |
| Nokia Lumia | Windows Phone | IE Mobile         | 11       | NO          |         | NO       | NO          | NO             |                                                                                  |
| Desktop     | Mac           | Chrome            | 43       | OK          |         | OK       | OK          | OK             |                                                                                  |
| Desktop     | Mac           | Firefox           | 36       | OK          |         | OK       | OK          | OK             |                                                                                  |
| Desktop     | Windows 8     | Internet Explorer | 10       | OK          |         | OK       | OK          | OK             | Scoped : CSS Order Wrong.2= 2 inline 3= 4 ship.html 4= 4 ship.html 5= 5 test.css |
| Desktop     | Windows 8     | Internet Explorer | 10 Metro | OK          |         | OK       | OK          | OK             | Scoped : CSS Order Wrong.2= 2 inline 3= 4 ship.html 4= 4 ship.html 5= 5 test.css |
| Desktop     | Windows       | Internet Explorer | 11       | OK          |         | OK       | OK          | OK             |                                                                                  |
| Desktop     | Windows       | Internet Explorer | 8        | NO          |         | NO       | NO          | NO             |                                                                                  |
| Desktop     | Windows       | Internet Explorer | 9        | OK          |         | OK       | OK          | OK             | Needs Same-Protocol. (XHR-XDR)2 = 2 inline 3 = 3 main.scss 4 = 4 ship.html 5     |
| Desktop     | Mac           | Safari            | 8        | OK          |         | OK       | OK          | OK             |                                                                                  |


# Sandboxing: 
We have 3 embed modes, from less to more isolation :
- JS, (manifest.index == `*.js`) : Dumps the JS in the page at the Insertion point.
- Scoped (settings.sandbox = `Falsy`) (Scopes Styles automatically)
- Sandboxed (settings.sandbox = `Truthy`)(Renders everything into a completely isolated container)

# Building the library
Checkout

    git clone git@github.com:hull/hull-js.git

First, install gulp

    sudo npm install -g gulp

Then switch to hull-js dir

    cd hull-js
    npm install
    gulp build

The last command will start a static HTTP server (port `3001`) that serves the files located in the root folder.

## Developing

A boilerplate app is located in the `app` folder. Here's how to use it:

```
cp app/app.example.js app/app.js
gulp
```

Gulp will automatically start a Webpack server with live reloading.
When it is done, you can point your browser to [http://localhost:3001](http://localhost:3001)

__Note__: You must enter some keys in `app/app.js`. Find them by creating an Organization and a Platform at [https://dashboard.hullapp.io](https://dashboard.hullapp.io).

# Main `gulp` tasks

* `build`: Builds and executes the tests
* `server` (default): `dist` + starts a live reloading server for development

# Releasing

* We use continuous integration.

* Checkout `master`
* `git flow release start 'YOUR_RELEASE_VERSION_NAME'`
* Merge your changes
* Bump `YOUR_RELEASE_VERSION_NAME` in `bower.json` and `package.json`
* Write Changelog
* Commit changes
* `git flow release finish 'YOUR_RELEASE_VERSION_NAME'`

# Contributing
You're encouraged to submit pull requests,
propose features and [discuss issues](http://github.com/hull/hull.js/issues).

If you want to submit code:

* Fork the project
* Write tests for your new feature or a test that reproduces a bug
* Implement your feature or make a bug fix
* Commit, push and make a pull request. Bonus points for topic branches.

# License
MIT License. See LICENSE for details.

# Copyright
Copyright (c) 2015 Hull, Inc.
