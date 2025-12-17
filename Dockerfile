# Build stage for Bitcoin Core
FROM alpine:3.22 AS bitcoin-core

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
        cmake \
        automake \
        boost-dev \
        build-base \
        clang \
        chrpath \
        file \
        gnupg \
        libevent-dev \
        libressl \
        libtool \
        linux-headers \
        sqlite-dev \
        zeromq-dev \
        bash \
        curl \
        capnproto-dev \
        capnproto

ADD ./bitcoin /bitcoin

ENV BITCOIN_PREFIX=/opt/bitcoin

WORKDIR /bitcoin

RUN cmake -B build \
  -DCMAKE_CXX_FLAGS_RELWITHDEBINFO="-O2 -g0" \
  -DCMAKE_CXX_COMPILER=clang++ \
  -DCMAKE_C_COMPILER=clang \
  -DCMAKE_INSTALL_PREFIX=${BITCOIN_PREFIX} \
  -DINSTALL_MAN=OFF \
  -DBUILD_TESTS=OFF \
  -DBUILD_BENCH=OFF \
  -DBUILD_GUI=OFF \
  -DBUILD_CLI=ON \
  -DBUILD_DAEMON=ON \
  -DENABLE_IPC=ON \
  -DREDUCE_EXPORTS=ON \
  -DWITH_CCACHE=OFF \
  -DWITH_ZMQ=ON
RUN cmake --build build -j$(nproc)
RUN cmake --install build
RUN strip ${BITCOIN_PREFIX}/bin/*

# Build stage for compiled artifacts
FROM alpine:3.22

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
  bash \
  curl \
  libevent \
  libzmq \
  sqlite-dev \
  tini \
  yq \
  jq \
  capnproto

ARG ARCH

ENV BITCOIN_DATA=/root/.bitcoin
ENV BITCOIN_PREFIX=/opt/bitcoin
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

COPY --from=bitcoin-core /opt /opt

EXPOSE 8332 8333
