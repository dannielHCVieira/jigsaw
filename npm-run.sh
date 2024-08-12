#!/bin/sh

scriptDir=$(cd `dirname $0`; pwd)

if [[ "$AWADE_BUILD_RESOURCE" == "" || ! -d "$AWADE_BUILD_RESOURCE" ]]; then
    echo "Error: param AWADE_BUILD_RESOURCE is invalid, we need this env param to locate all resource files!"
    exit 1
fi

nodeHome="$AWADE_BUILD_RESOURCE/node-env/node-v16.17.0-linux-x64/bin"
echo "nodeHome: $nodeHome"
export PATH="$nodeHome:$PATH"

cd $scriptDir

node -v
npm -v

npm run "$@"
