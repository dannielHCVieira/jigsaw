#!/bin/sh

nodeHome="$AWADE_BUILD_RESOURCE/node-env/node-v16.17.0-linux-x64/bin"
echo "nodeHome: $nodeHome"
export PATH="$nodeHome:$PATH"
node $@
