#!/usr/bin/bash -e

export ENDPOINT=localhost:80
export K6_STATSD_ENABLE_TAGS=true
DIR=$(dirname $0)

for file in $DIR/*.js
do
    k6 -c $DIR/k6.json run --out statsd $file
done
