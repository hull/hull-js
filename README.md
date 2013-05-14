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



