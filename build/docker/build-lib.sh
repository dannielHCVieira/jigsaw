#!/bin/sh

scriptDir=$(cd `dirname $0`; pwd)

cd $scriptDir/../tools/build-lib

node -v
npm -v
if [ $? -ne 0 ]; then
    echo "invalid node runtime"
    exit 1
fi

start_time=`date +%s`
node build-lib.js "$@"
if [ $? -ne 0 ]; then
    echo "build-lib.sh failed：node build-lib.js $@"
    exit 1
fi

echo "build-lib.sh success：node build-lib.js $@, spent: $((`date +%s`-start_time))"
exit 0