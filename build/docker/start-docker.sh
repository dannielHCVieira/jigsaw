#!/bin/bash

change=$1
patch=$2
ngVersion=$3

home=$(cd `dirname $0`/../..; pwd);
cd $home

dockerName="jigsaw_build_${change}_${patch}_${ngVersion}"
echo "start-docker >>>>>>>>>> dockerName: $dockerName"

cleanupDocker() {
    echo "cleanupDocker >>>>>>>>>> $dockerName ..."
    # 停止并删除容器
    containerId=$(docker ps -a | grep $dockerName | awk {'print $1'})
    if [ ! -z "$containerId" ]; then
        echo "$dockerName: 停止并删除容器 $containerId ..."
        docker kill $containerId
        docker rm $containerId
    fi

    # 删除镜像
    imageId=$(docker images | grep $dockerName | awk {'print $3'})
    if [ ! -z "$imageId" ]; then
        docker rmi -f $imageId
    fi
}
cleanupDocker

# 新建一个临时目录，用来放对应的Dockerfile来构建镜像
tempDockerDir="temp_docker_build_$ngVersion"
mkdir $tempDockerDir
cp build/docker/Dockerfile $tempDockerDir
# 替换 Dockerfile 中的构建参数
sed -i "s/__CHANGE__/${change}/g" $tempDockerDir/Dockerfile
sed -i "s/__PATCH__/${patch}/g" $tempDockerDir/Dockerfile
sed -i "s/__NG_VERSION__/${ngVersion}/g" $tempDockerDir/Dockerfile

# 构建编译镜像
docker build -t $dockerName:latest -f $tempDockerDir/Dockerfile $JIGSAW_BUILD_ROOT/change-$change-$patch

imageId=$(docker images | grep $dockerName | awk {'print $3'})
echo "$dockerName: imageId >>>>>>>>>> $imageId ..."
if [ -z "$imageId" ]; then
    echo "$dockerName: 镜像构建失败"
    exit 1
fi

# 基于创建的镜像，启动一个容器。同时将服务器上的 AWADE_BUILD_RESOURCE 目录挂载到容器中，方便获取编译资源
docker run -v $AWADE_BUILD_RESOURCE:/data/awade-build/resource --name $dockerName ${imageId} &
timeout=0
while true; do
    status=$(docker inspect $dockerName --format '{{.State.Status}}')
    echo "$dockerName: 当前容器状态 >>>>>> status: $status"
    if [ "$status" = "running" ]; then
        break
    fi
    sleep 3
    timeout=$((timeout + 3))
    if [ $timeout -ge 60 ]; then
        echo "$dockerName: 容器启动超时（60秒），当前状态: $status"
        exit 1
    fi
done

containerId=$(docker ps -a | grep $dockerName | awk {'print $1'})
echo "$dockerName: containerId >>>>>>>>>> $containerId ..."
if [ -z "$containerId" ]; then
    echo "$dockerName: 未发现编译容器"
    cleanupDocker
    exit 1
fi

exitCode=$(docker wait $dockerName)
echo "$dockerName: docker wait >>>>>>>>>> exitCode: $exitCode"
docker cp $containerId:/data/build/build-in-docker-$ngVersion.log .
if [ "$exitCode" != "0" ]; then
    cleanupDocker
    exit $exitCode
fi

if [ "$ngVersion" = "ng9" ]; then
    cleanupDocker
    exit 0
fi

# 等待容器执行完毕，拷贝出dist
rm -rf dist
echo "$dockerName: cp dist from $containerId ..."
docker cp $containerId:/data/build/dist .
if [ "$?" != "0" ]; then
    echo "$dockerName: Error: docker cp $containerId:/data/build/dist ."
    cleanupDocker
    exit 1
fi

cleanupDocker