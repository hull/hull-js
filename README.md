
### Rebuilding the library

Checkout

    git@github.com:hull/hull-js.git

First, install grunt and bower

    sudo npm install -g grunt-cli bower

Switch to hull-js dir

    cd hull-js
    npm install; bower install

Serve it to js.hull.dev via pow

    echo 3001 > ~/.pow/js.hull


Configure ```app/app.js``` with the correct settings


Start grunt

    grunt

Open in your browser

    open http://js.hull.dev

Drink your coffee.
