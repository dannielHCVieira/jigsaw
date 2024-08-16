#!/bin/sh

scriptDir=$(cd `dirname $0`; pwd)

$AWADE_BUILD_RESOURCE/node-env/node-v16.17.0-linux-x64/bin/node $@
