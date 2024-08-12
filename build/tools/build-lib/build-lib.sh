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
if [ $? -ne 0 ]; then
    echo "无效的node运行时！"
    exit 1
fi

node build-lib.js "$@"
if [ $? -ne 0 ]; then
    echo "构建脚本执行失败！"
    exit 1
fi

echo "构建脚本执行成功！"
