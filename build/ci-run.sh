#!/bin/bash

if [[ "$AWADE_BUILD_RESOURCE" == "" || ! -d "$AWADE_BUILD_RESOURCE" ]]; then
    echo "Error: param AWADE_BUILD_RESOURCE is invalid, we need this env param to locate all resource files!"
    exit 1
fi

home=$(cd `dirname $0`/..; pwd);
cd $home

echo "preparing node_modules ...."
tar xfz $AWADE_BUILD_RESOURCE/jigsaw_node_modules/node_modules.ng9.tgz -C ./
chmod +x ./node_modules/.bin/*
npm install --registry=https://artsh.zte.com.cn/artifactory/api/npm/rnia-npm-virtual/ || {
    echo "Error: npm install failed"
    exit 1
}

runScript() {
    echo "Running script: $1"
    node $1 || {
        echo "Error: Script failed - $1"
        exit 1
    }
}
runShell() {
    echo "Running shell: $@"
    sh "$@" || {
        echo "Error: Shell failed - $@"
        exit 1
    }
}
runScript build/scripts/check-demo-import.js
runScript build/scripts/check-html-element-type.js
runScript build/scripts/check-import-path.js
runScript build/scripts/check-mark-for-check.js
runScript build/scripts/check-public-variables.js
runScript build/scripts/check-scss-in-demo.js
runScript build/scripts/check-tagname-selector.js
runScript build/scripts/extract-theme-variables.js
runScript build/scripts/check-extraction.js
runScript build/scripts/check-non-i18n-terms.js
runScript build/scripts/create-component-wings-theme.js
runScript build/scripts/generate-external-demo-info.js
runScript build/scripts/generate-external-navigation-info.js
runScript build/scripts/create-omni-components.js

runShell build/tools/build-lib/build-lib.sh build:jigsaw ng9
runShell build/tools/build-lib/build-lib.sh build:formly ng9

runShell build/tools/build-lib/build-lib.sh build:jigsaw-novice-guide
runShell build/tools/build-lib/build-lib.sh build:formly
runShell build/tools/build-lib/build-lib.sh build:jigsaw-omni

npm test || {
    echo "Error: npm test failed"
    exit 1
}
