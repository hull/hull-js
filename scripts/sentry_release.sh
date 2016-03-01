#!/bin/bash
if [ -n "$SENTRY_URL" ]; then
  curl -v $SENTRY_URL -X POST -H 'Content-Type: application/json' -d '{"version":"'"$CIRCLE_SHA1"'", "ref":"'"$CIRCLE_SHA1"'"}'
else
  echo "SENTRY_URL is not set"
fi
