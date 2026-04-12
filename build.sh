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

# Build BDB 4.8 from depends system so the wallet can open legacy BDB wallets
BDB_PREFIX="/bitcoin/depends/${HOST_TRIPLE}"
echo "Building BDB 4.8 for ${HOST_TRIPLE}..."
make -C /bitcoin/depends \
    HOST="${HOST_TRIPLE}" \
    CC="clang --target=${HOST_TRIPLE} --sysroot=/sysroot" \
    CXX="clang++ --target=${HOST_TRIPLE} --sysroot=/sysroot" \
    LDFLAGS="-fuse-ld=lld" \
    AR="llvm-ar" \
    RANLIB="llvm-ranlib" \
    STRIP="llvm-strip" \
    NM="llvm-nm" \
    NO_BOOST=1 NO_LIBEVENT=1 NO_QT=1 NO_SQLITE=1 NO_UPNP=1 NO_NATPMP=1 NO_ZMQ=1 NO_USDT=1 \
    -j"$(nproc)"

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
    --with-daemon \
    --enable-reduce-exports \
    --with-boost=/sysroot/usr \
    --with-zmq \
    BDB_LIBS="-L${BDB_PREFIX}/lib -ldb_cxx-4.8" \
    BDB_CFLAGS="-I${BDB_PREFIX}/include"

make -j"$(nproc)"
make install
llvm-strip "${BITCOIN_PREFIX}/bin/"*
