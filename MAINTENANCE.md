# Maintenance operations on hull.js

## Configuring AWS tasks:

We use S3 internally. A grunt task to deploy in S3 is provided.
If you want to deploy to S3 too, follow these instructions:

Create the file `.grunt/grunt-aws.json`, with the following content :

    {
      "key":"YOUR_AWS_KEY",
      "secret":"YOUR_AWS_SECRET",
      "bucket":"YOUR_AWS_BUCKET" // Without the "s3.amazonaws.com" part
      "distribution":"YOUR_CLOUDFRONT_DISTRIBUTION" // If you use cloudfront
    }

## Creating a release

* Update `CHANGELOG.md`
* `grunt bump:[major|minor|patch]`

## Deploying a release

* `git checkout %VERSION%`
* `grunt deploy`

## Invalidates Cloudfront cache

```
$ grunt cloudfront_invalidate --file=path/to/file.ext
```
