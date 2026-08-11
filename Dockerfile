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

# Pinned Bitcoin Core release signers. Signer coverage varies per release — no
# single signer signs every one — so the build does NOT require all of them: it
# requires REQUIRED_QUORUM DISTINCT signers from this set. Re-verify the quorum
# still holds when bumping VERSION (parse the release's SHA256SUMS.asc and count
# how many of these fingerprints signed it); only rotate the set and refresh
# assets/release-keys/ if it does not.
#
# Three of these are signing SUBKEYS, so a signature by them reports a different
# (primary) fingerprint than the one pinned here:
#   637DB1E2… → 9EDAFF80E080659604F4A76B2EBB056FD847F8A7
#   CFB16E21… → E777299FC265DD04793070EB944D35F9AC3DB76A
#   0CCBAAFD… → 982A193E3CE0EED535E09023188CBB2648416AD5
# The verification step below therefore resolves every pin to its primary at
# build time rather than comparing against this list verbatim.
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

# Verify SHA256SUMS.asc against the pinned signer set.
#
# The quorum counts DISTINCT signers, identified by primary fingerprint. GnuPG
# emits one status line per signature PACKET, so counting packets would let a
# single compromised key satisfy the quorum by signing REQUIRED_QUORUM times —
# reducing a stated 5-of-7 tolerance to 0 compromised keys. VALIDSIG's last
# field is the signing key's primary fingerprint, so subkey signatures roll up
# to the signer that owns them.
#
# A VALIDSIG alone is not enough to count: GnuPG also emits one for a signature
# by an expired or revoked key, pairing it with EXPKEYSIG/REVKEYSIG instead of
# GOODSIG. Counting those would be laxer than what this replaced, so the walk
# below only counts a VALIDSIG whose signature reported GOODSIG.
#
# The keyring is asserted equal to the pinned primaries first, so the count can
# be taken over the keyring as a whole: a stray key dropped into
# assets/release-keys/ fails the build rather than voting in the quorum.
#
# gpg's exit code is unusable here: GnuPG 2.4+ returns non-zero for ERRSIG
# (signatures by signers outside the keyring) even when the pinned-key
# signatures verified fine.
RUN set -e; \
    export LC_ALL=C; \
    gpg --import /tmp/release-keys/*.asc; \
    rm -rf /tmp/release-keys; \
    : > /tmp/pinned-primaries.raw; \
    for fp in ${PINNED_FINGERPRINTS}; do \
        gpg --with-colons --list-keys "$fp" 2>/dev/null \
          | awk -F: '/^fpr:/{print $10; exit}' >> /tmp/pinned-primaries.raw; \
    done; \
    sort -u /tmp/pinned-primaries.raw > /tmp/pinned-primaries; \
    expected=$(echo ${PINNED_FINGERPRINTS} | wc -w); \
    if [ "$(wc -l < /tmp/pinned-primaries)" -ne "${expected}" ]; then \
        echo "PINNED KEY MISSING OR DUPLICATED (expected ${expected} distinct primaries)"; exit 1; \
    fi; \
    gpg --with-colons --list-keys \
      | awk -F: '/^pub:/{p=1} p && /^fpr:/{print $10; p=0}' | sort -u > /tmp/keyring-primaries; \
    if ! diff -q /tmp/pinned-primaries /tmp/keyring-primaries >/dev/null; then \
        echo "KEYRING CONTAINS KEYS OUTSIDE THE PINNED SET"; exit 1; \
    fi; \
    gpg --verify --status-fd 1 SHA256SUMS.asc SHA256SUMS 2>/dev/null > /tmp/gpg-status || true; \
    bad=$(grep -c '^\[GNUPG:\] BADSIG' /tmp/gpg-status || true); \
    signers=$(awk '/^\[GNUPG:\] NEWSIG/{g=0} /^\[GNUPG:\] GOODSIG/{g=1} /^\[GNUPG:\] VALIDSIG/{if(g)print $NF; g=0}' /tmp/gpg-status \
      | grep -Ex '[0-9A-F]{40}' | sort -u | comm -12 - /tmp/pinned-primaries | wc -l); \
    skipped=$(grep -cE '^\[GNUPG:\] (EXPKEYSIG|REVKEYSIG)' /tmp/gpg-status || true); \
    echo "Distinct pinned signers: ${signers}, bad: ${bad}, uncounted (expired/revoked key): ${skipped} (need ${REQUIRED_QUORUM}, 0)"; \
    if [ "${bad}" -ne 0 ]; then echo "BAD SIGNATURE FROM PINNED KEY"; exit 1; fi; \
    if [ "${signers}" -lt "${REQUIRED_QUORUM}" ]; then echo "INSUFFICIENT QUORUM"; exit 1; fi

RUN grep " $(cat /tarball-name)$" SHA256SUMS | sha256sum -c

RUN tar -xzf "$(cat /tarball-name)" --strip-components=1

# Final image
FROM debian:stable-slim

ENV BITCOIN_DATA=/root/.bitcoin
ENV BITCOIN_PREFIX=/opt/bitcoin
ENV PATH=${BITCOIN_PREFIX}/bin:$PATH

# curl is load-bearing: the assumeutxo action shells out to it in this image
# to download the UTXO snapshot.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates curl e2fsprogs jq tini yq && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/bin/bitcoind ${BITCOIN_PREFIX}/bin/
COPY --from=builder /build/bin/bitcoin-cli ${BITCOIN_PREFIX}/bin/
COPY --from=builder /build/libexec/bitcoin-node ${BITCOIN_PREFIX}/libexec/

EXPOSE 8332 8333
