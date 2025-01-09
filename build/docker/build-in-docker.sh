#!/bin/bash

change=$1
patch=$2
ngVersion=$3

home=$(cd `dirname $0`/../..; pwd);
cd $home

echo "start run build-in-docker.sh..." >> build-in-docker-$ngVersion.log

runShell() {
    echo "Running shell: $@"
    sh "$@" || {
        echo "Error: Shell failed - $@" >> build-in-docker-$ngVersion.log
        exit 1
    }
}

if [[ "$AWADE_BUILD_RESOURCE" == "" || ! -d "$AWADE_BUILD_RESOURCE" ]]; then
    echo "Error: param AWADE_BUILD_RESOURCE is invalid, we need this env param to locate all resource files!"
    exit 1
fi

if [ "$ngVersion" = "ng9" ]; then
    nodeHome="$AWADE_BUILD_RESOURCE/node-env/node-v16.17.0-linux-x64/bin"
else
    nodeHome="$AWADE_BUILD_RESOURCE/node-env/node-v18.20.5-linux-x64/bin"
fi
echo "nodeHome: $nodeHome"
export PATH="$nodeHome:$PATH"

echo "preparing node_modules ...."
tar xfz $AWADE_BUILD_RESOURCE/jigsaw_node_modules/node_modules.$ngVersion.tgz -C ./
runShell build/docker/build-lib.sh npmInstall $ngVersion --inDocker >> build-in-docker-$ngVersion.log
chmod +x ./node_modules/.bin/*

if [ "$ngVersion" = "ng9" ]; then
    runShell build/docker/build-lib.sh build:jigsaw ng9 --inDocker >> build-in-docker-$ngVersion.log
    runShell build/docker/build-lib.sh build:formly ng9 --inDocker >> build-in-docker-$ngVersion.log
else
    runShell build/docker/build-lib.sh build:jigsaw-novice-guide ng18 --inDocker >> build-in-docker-$ngVersion.log
    runShell build/docker/build-lib.sh build:formly ng18 --inDocker >> build-in-docker-$ngVersion.log
    runShell build/docker/build-lib.sh build:jigsaw-omni ng18 --inDocker >> build-in-docker-$ngVersion.log

    start_time=`date +%s`
    node build/build.js jigsaw-app-internal ng18 prod dist /lui-dev/jigsaw/change-$change-$patch/ inDocker >> build-in-docker-$ngVersion.log || {
        echo "Error: node build/build.js jigsaw-app-internal" >> build-in-docker-$ngVersion.log
        exit 1
    }
    echo "build/build.js jigsaw-app-internal ng18 success, spent: $((`date +%s`-start_time))" >> build-in-docker-$ngVersion.log
fi

echo "run build-in-docker.sh success" >> build-in-docker-$ngVersion.log
exit 0