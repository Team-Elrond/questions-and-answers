#!/usr/bin/bash -e

export ENDPOINT=localhost:80
export K6_STATSD_ENABLE_TAGS=true
DIR=$(dirname $0)

for file in $DIR/*.js; do
    if [ "$file" != "$DIR/index.js" ]; then
        k6 run --out statsd $file
    fi
done
