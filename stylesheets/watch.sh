#!/bin/sh

# No minification
#sass --watch hull.scss:hull.css --style expanded

sass --watch hull.scss:hull.css --style compressed

exit 0
