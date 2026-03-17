#!/bin/bash
set -euo pipefail

TARGETARCH="${TARGETARCH:-}"
BITCOIN_PREFIX="${BITCOIN_PREFIX:-/opt/bitcoin}"

# Configure pkg-config to use sysroot
export PKG_CONFIG_SYSROOT_DIR=/sysroot
export PKG_CONFIG_PATH=/sysroot/usr/lib/pkgconfig:/sysroot/usr/share/pkgconfig
export PKG_CONFIG_LIBDIR=/sysroot/usr/lib/pkgconfig:/sysroot/usr/share/pkgconfig

case "$TARGETARCH" in
    amd64)
        HOST_TRIPLE="x86_64-alpine-linux-musl"
        ;;
    arm64)
        HOST_TRIPLE="aarch64-alpine-linux-musl"
        ;;
    riscv64)
        HOST_TRIPLE="riscv64-alpine-linux-musl"
        RISCV_ARCH_FLAGS="-march=rva23u64"
        ;;
    *)
        echo "Unsupported TARGETARCH: $TARGETARCH" >&2
        exit 1
        ;;
esac

COMMON_FLAGS="--sysroot=/sysroot --target=${HOST_TRIPLE} ${RISCV_ARCH_FLAGS:-}"

export CC="clang"
export CXX="clang++"
export CFLAGS="${COMMON_FLAGS} -O2"
export CXXFLAGS="${COMMON_FLAGS} -O2"
export LDFLAGS="--sysroot=/sysroot --target=${HOST_TRIPLE} -fuse-ld=lld -L/sysroot/usr/lib"

./autogen.sh

# --disable-suppress-external-warnings: Bitcoin Core's configure converts -I to
# -isystem for dependency headers (to suppress warnings). With --sysroot, this
# converts -I/sysroot/usr/include to -isystem /sysroot/usr/include, which places
# it before GCC's C++ headers in clang's search order. That breaks #include_next
# in cstdlib (it can only resolve stdlib.h AFTER its own position). Disabling
# this conversion keeps -I flags as-is, which --sysroot handles correctly.
./configure \
    --host="${HOST_TRIPLE}" \
    --prefix="${BITCOIN_PREFIX}" \
    --disable-man \
    --disable-tests \
    --disable-bench \
    --disable-ccache \
    --disable-suppress-external-warnings \
    --with-gui=no \
    --with-utils \
    --with-libs \
    --with-sqlite=yes \
    --without-bdb \
    --with-daemon \
    --enable-reduce-exports \
    --with-boost=/sysroot/usr \
    --with-zmq

make -j"$(nproc)"
make install
llvm-strip "${BITCOIN_PREFIX}/bin/"*
