# Build stage for Bitcoin Core
FROM alpine:3.21 AS bitcoin-core

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
        curl

ADD ./bitcoin /bitcoin

ENV BITCOIN_PREFIX=/opt/bitcoin

WORKDIR /bitcoin

RUN make -C depends NO_BOOST=1 NO_LIBEVENT=1 NO_QT=1 NO_SQLITE=1 NO_UPNP=1 NO_ZMQ=1 NO_USDT=1

ARG TARGETARCH
RUN if [ "$TARGETARCH" = "arm64" ]; then \
        export BDB_PREFIX="/bitcoin/depends/aarch64-unknown-linux-musl"; \
    elif [ "$TARGETARCH" = "amd64" ]; then \
        export BDB_PREFIX="/bitcoin/depends/x86_64-pc-linux-musl"; \
    fi && \
    echo "export BDB_PREFIX=$BDB_PREFIX" > /tmp/bdb_prefix.sh

RUN . /tmp/bdb_prefix.sh && \
    cmake -B build -DCMAKE_LD_FLAGS=-L`ls -d /opt/db*`/lib/ -DCMAKE_CPP_FLAGS=-I`ls -d /opt/db*`/include/ \
  # If building on Mac make sure to increase Docker VM memory, or uncomment this line. See https://github.com/bitcoin/bitcoin/issues/6658 for more info.
  # CXXFLAGS="--param ggc-min-expand=1 --param ggc-min-heapsize=32768" \
  -DBerkeleyDB_INCLUDE_DIR:PATH="${BDB_PREFIX}/include" -DWITH_BDB=ON \
  -DCMAKE_CXX_FLAGS="-O2" \
  -DCMAKE_CXX=clang++ CC=clang \
  -DCMAKE_INSTALL_PREFIX=${BITCOIN_PREFIX} \
  -DINSTALL_MAN=OFF \
  -DBUILD_TESTS=OFF \
  -DBUILD_BENCH=OFF \
  -DWITH_CCACHE=OFF \
  -DBUILD_GUI=OFF \
  #--with-utils \
  -DBUILD_CLI=ON \
  -DBUILD_BITCOINCONSENSUS_LIB=ON \
  -DWITH_SQLITE=ON \
  -DBUILD_DAEMON=ON \
  -DENABLE_HARDENING=ON \
  -DREDUCE_EXPORTS=ON \
  -DWITH_ZMQ=ON
RUN cmake --build build -j$(nproc)
RUN cmake --install build
RUN strip ${BITCOIN_PREFIX}/bin/*

# Build stage for compiled artifacts
FROM alpine:3.21


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
RUN rm -rf /var/cache/apk/*

ARG ARCH

ENV BITCOIN_DATA=/root/.bitcoin
ENV BITCOIN_PREFIX=/opt/bitcoin
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

COPY --from=bitcoin-core /opt /opt

EXPOSE 8332 8333