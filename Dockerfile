# Build stage: download upstream Guix-attested release tarball,
# verify against a pinned 5-of-7 quorum of Bitcoin Core release signers,
# and extract.
FROM debian:stable-slim AS builder

ARG VERSION
ARG TARGETPLATFORM

WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates wget gnupg && \
    rm -rf /var/lib/apt/lists/*

# Pinned Bitcoin Core release signers. Each of these has signed every
# Core release in the 28.x–31.x range (with the exception of 0xB10C,
# who signed 29.3, 30.2, 31.0 but not 28.3 or 28.4). Build requires
# REQUIRED_QUORUM valid signatures from this set.
ENV PINNED_FINGERPRINTS="\
152812300785C96444D3334D17565732E08E5E41 \
637DB1E23370F84AFF88CCE03152347D07DA627C \
CFB16E21C950F67FA95E558F2EEB9F5CC09526C1 \
D1DBF2C4B96F2DEBF4C16654410108112E7EA81F \
E61773CD6E01040E2F1BD78CE7E2984B6289C93A \
F4FC70F07310028424EFC20A8E4256593F177720 \
0CCBAAFD76A2ECE2CCD3141DE2FFD5B1D88CA97D"
ENV REQUIRED_QUORUM=5

RUN case "${TARGETPLATFORM}" in \
      "linux/amd64")   echo "x86_64-linux-gnu"  > /tarball-arch ;; \
      "linux/arm64")   echo "aarch64-linux-gnu" > /tarball-arch ;; \
      "linux/riscv64") echo "riscv64-linux-gnu" > /tarball-arch ;; \
      *) echo "Unsupported platform: ${TARGETPLATFORM}" && exit 1 ;; \
    esac && \
    echo "bitcoin-${VERSION}-$(cat /tarball-arch).tar.gz" > /tarball-name

RUN url="https://bitcoincore.org/bin/bitcoin-core-${VERSION}" && \
    wget -q "${url}/$(cat /tarball-name)" \
            "${url}/SHA256SUMS" \
            "${url}/SHA256SUMS.asc"

COPY assets/release-keys/ /tmp/release-keys/
RUN gpg --import /tmp/release-keys/*.asc && \
    for fp in ${PINNED_FINGERPRINTS}; do \
        gpg --list-keys "$fp" >/dev/null 2>&1 || { echo "MISSING PINNED KEY: $fp"; exit 1; }; \
    done && \
    rm -rf /tmp/release-keys

# Verify SHA256SUMS.asc: any BADSIG from a pinned key fails the build,
# and at least REQUIRED_QUORUM pinned signers must verify successfully.
# (We don't use gpg's exit code because GnuPG 2.4+ treats ERRSIG —
# signatures from non-pinned signers — as a non-zero exit even when
# pinned-key signatures verified fine.)
RUN gpg --verify --status-fd 1 SHA256SUMS.asc SHA256SUMS 2>/dev/null > /tmp/gpg-status; \
    bad=$(grep -c '^\[GNUPG:\] BADSIG' /tmp/gpg-status || true); \
    good=$(grep -c '^\[GNUPG:\] GOODSIG' /tmp/gpg-status || true); \
    echo "Pinned signatures: good=${good}, bad=${bad} (need ${REQUIRED_QUORUM} good, 0 bad)"; \
    [ "${bad}" -eq 0 ] || { echo "BAD SIGNATURE FROM PINNED KEY"; exit 1; }; \
    [ "${good}" -ge "${REQUIRED_QUORUM}" ] || { echo "INSUFFICIENT QUORUM"; exit 1; }

RUN grep " $(cat /tarball-name)$" SHA256SUMS | sha256sum -c

RUN tar -xzf "$(cat /tarball-name)" --strip-components=1

# Final image
FROM debian:stable-slim

ENV BITCOIN_DATA=/root/.bitcoin
ENV BITCOIN_PREFIX=/opt/bitcoin
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates curl e2fsprogs jq tini yq && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/bin/bitcoind ${BITCOIN_PREFIX}/bin/
COPY --from=builder /build/bin/bitcoin-cli ${BITCOIN_PREFIX}/bin/

EXPOSE 8332 8333
