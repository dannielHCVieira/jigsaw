FROM 9f784d3abfe5

ENV AWADE_BUILD_RESOURCE    /data/awade-build/resource
ENV HOME_DIR                /data/build

RUN mkdir -p                $HOME_DIR
WORKDIR                     $HOME_DIR

COPY . $HOME_DIR

CMD sh $HOME_DIR/build/docker/build-in-docker.sh __CHANGE__ __PATCH__ __NG_VERSION__