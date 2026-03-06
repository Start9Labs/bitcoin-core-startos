# Sysroot stage - runs on target platform to get native libraries
FROM alpine:3.22 AS sysroot

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
        musl-dev \
        gcc \
        g++ \
        libstdc++-dev \
        clang \
        compiler-rt \
        boost-dev \
        libevent-dev \
        sqlite-dev \
        libsodium-dev \
        zeromq-dev \
        linux-headers && \
    # Remove ZeroMQ cmake config - it has hardcoded absolute paths that break cross-compilation
    rm -rf /usr/lib/cmake/ZeroMQ

# Build stage for Bitcoin Core - runs on build platform
FROM --platform=$BUILDPLATFORM alpine:3.22 AS builder

ARG TARGETARCH

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
        cmake \
        automake \
        build-base \
        clang \
        lld \
        llvm \
        chrpath \
        file \
        gnupg \
        libressl \
        libtool \
        linux-headers \
        bash \
        curl \
        pkgconf

ADD ./bitcoin /bitcoin

COPY build.sh /build.sh

ENV BITCOIN_PREFIX=/opt/bitcoin

WORKDIR /bitcoin

RUN --mount=type=bind,from=sysroot,source=/,target=/sysroot,ro \
    /build.sh

# Runtime stage
FROM alpine:3.22

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add \
  bash \
  curl \
  libevent \
  libsodium \
  libzmq \
  sqlite-dev \
  tini \
  yq \
  jq

ARG ARCH

ENV BITCOIN_DATA=/root/.bitcoin
ENV BITCOIN_PREFIX=/opt/bitcoin
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

COPY --from=builder /opt /opt

EXPOSE 8332 8333
