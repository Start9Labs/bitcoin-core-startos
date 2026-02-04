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
        CLANG_TARGET="x86_64-alpine-linux-musl"
        CMAKE_SYSTEM_PROCESSOR="x86_64"
        ;;
    arm64)
        CLANG_TARGET="aarch64-alpine-linux-musl"
        CMAKE_SYSTEM_PROCESSOR="aarch64"
        ;;
    riscv64)
        CLANG_TARGET="riscv64-alpine-linux-musl"
        CMAKE_SYSTEM_PROCESSOR="riscv64"
        # Enable RVA23 profile: RV64GCV with all mandatory extensions
        RISCV_ARCH_FLAGS="-march=rva23u64"
        ;;
    *)
        echo "Unsupported TARGETARCH: $TARGETARCH" >&2
        exit 1
        ;;
esac

# Build BDB 4.8 from depends system for the target architecture
BDB_PREFIX="/bitcoin/depends/${CLANG_TARGET}"
echo "Building BDB 4.8 for ${CLANG_TARGET}..."
make -C /bitcoin/depends \
    HOST="${CLANG_TARGET}" \
    CC="clang --target=${CLANG_TARGET} --sysroot=/sysroot" \
    CXX="clang++ --target=${CLANG_TARGET} --sysroot=/sysroot" \
    LDFLAGS="-fuse-ld=lld" \
    AR="llvm-ar" \
    RANLIB="llvm-ranlib" \
    STRIP="llvm-strip" \
    NM="llvm-nm" \
    NO_BOOST=1 NO_LIBEVENT=1 NO_QT=1 NO_SQLITE=1 NO_UPNP=1 NO_ZMQ=1 NO_USDT=1 \
    -j"$(nproc)"

cat > /tmp/toolchain.cmake <<EOF
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR ${CMAKE_SYSTEM_PROCESSOR})
set(CMAKE_SYSROOT /sysroot)
set(CMAKE_C_COMPILER clang)
set(CMAKE_CXX_COMPILER clang++)
set(CMAKE_C_COMPILER_TARGET ${CLANG_TARGET})
set(CMAKE_CXX_COMPILER_TARGET ${CLANG_TARGET})
set(CMAKE_C_FLAGS_INIT "${RISCV_ARCH_FLAGS:-}")
set(CMAKE_CXX_FLAGS_INIT "${RISCV_ARCH_FLAGS:-}")
set(CMAKE_EXE_LINKER_FLAGS_INIT "-fuse-ld=lld -L/sysroot/usr/lib")
set(CMAKE_SHARED_LINKER_FLAGS_INIT "-fuse-ld=lld -L/sysroot/usr/lib")
set(CMAKE_FIND_ROOT_PATH /sysroot ${BDB_PREFIX})
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

EOF

cmake -B build \
    -DCMAKE_TOOLCHAIN_FILE=/tmp/toolchain.cmake \
    -DCMAKE_CXX_FLAGS_RELWITHDEBINFO="-O2 -g0" \
    -DCMAKE_INSTALL_PREFIX="${BITCOIN_PREFIX}" \
    -DINSTALL_MAN=OFF \
    -DBUILD_TESTS=OFF \
    -DBUILD_BENCH=OFF \
    -DBUILD_GUI=OFF \
    -DBUILD_CLI=ON \
    -DBUILD_DAEMON=ON \
    -DREDUCE_EXPORTS=ON \
    -DWITH_CCACHE=OFF \
    -DWITH_ZMQ=ON \
    -DWITH_BDB=ON

cmake --build build -j"$(nproc)"
cmake --install build
llvm-strip "${BITCOIN_PREFIX}/bin/"*
