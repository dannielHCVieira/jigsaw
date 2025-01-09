#!/bin/bash

if [[ "$AWADE_BUILD_RESOURCE" == "" || ! -d "$AWADE_BUILD_RESOURCE" ]]; then
    echo "Error: param AWADE_BUILD_RESOURCE is invalid, we need this env param to locate all resource files!"
    exit 1
fi

change=$1
patch=$2

nodeHome="$AWADE_BUILD_RESOURCE/node-env/node-v16.17.0-linux-x64/bin"
echo "nodeHome: $nodeHome"
export PATH="$nodeHome:$PATH"

home=$(cd `dirname $0`/..; pwd);
cd $home

echo "preparing node_modules ...."
tar xfz $AWADE_BUILD_RESOURCE/jigsaw_node_modules/node_modules.ng9.tgz -C ./
chmod +x ./node_modules/.bin/*
node build/npm-install.js ng9 || {
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
runDockerTask() {
    local ngVersion=$1
    runShell build/docker/start-docker.sh $change $patch $ngVersion
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

npm test || {
    echo "Error: npm test failed"
    exit 1
}

# 把这个node_modules挪出去，可以节省很多构建docker镜像的时间
rm -rf ../temp-change-$change-$patch
mkdir ../temp-change-$change-$patch
mv node_modules ../temp-change-$change-$patch/

# 并行执行两个 docker 任务
runDockerTask ng9 &
pid1=$!
runDockerTask ng18 &
pid2=$!
# 等待两个任务都完成
wait $pid1
if [ $? -ne 0 ]; then
    echo "Error: ng9 docker build failed"
    rm -rf ../temp-change-$change-$patch
    exit 1
fi
wait $pid2
if [ $? -ne 0 ]; then
    echo "Error: ng18 docker build failed"
    rm -rf ../temp-change-$change-$patch
    exit 1
fi

mv ../temp-change-$change-$patch/node_modules .
rm -rf ../temp-change-$change-$patch

if [[ ! -d "dist" ]]; then
    echo "Error: dist directory was not found after running docker build"
    exit 1
fi

echo "====================================================================================================="
echo "常用命令"
echo "cd /data/jigsaw-build/; tar xf change-$change-$patch.tar;"
echo "-----------------------------------------------------------------------------------------------------"
echo "快速测试环境，点击可立即启动"
echo "外网：https://rais.zte.com.cn:18770/lui-dev/jigsaw/change-$change-$patch/"
echo "内网：http://$CI_SERVER_HOST:8080/lui-dev/jigsaw/change-$change-$patch/"
echo "====================================================================================================="
