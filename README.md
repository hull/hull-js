# Hull.js [ ![Codeship Status for hull/hull-js](https://circleci.com/gh/hull/hull-js/tree/develop.png?circle-token=26a17dad6ac378f6028a460a5857d5ca15a8aa13) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhull%2Fhull-js.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhull%2Fhull-js?ref=badge_shield)
](https://circleci.com/gh/hull/hull-js)

# Building the library
Checkout

    git clone git@github.com:hull/hull-js.git

First, install gulp

    sudo npm install -g gulp

Then switch to hull-js dir

    cd hull-js
    npm install
    npm run build

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


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhull%2Fhull-js.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhull%2Fhull-js?ref=badge_large)

# Copyright
Copyright (c) 2015 Hull, Inc.