# F-03 — Add-user plaintext key-share persistency

Oct 25, 2026 · @Xsnsn

| Field | Value |
| --- | --- |
| Target | `fireblocks/mpc-lib` |
| Commit | `00ae08b` (29 July 2026) |
| Component | `src/common/cosigner/utils.cpp`, BAM add-user flow |
| Category | Sensitive-data memory persistency (SECURITY-MODEL §4.2) |
| Proposed severity | P3 (Medium), per §5.3 |
| PoC | `poc_add_user_share_not_wiped.cpp` (deterministic, Release build) |
| Fix | `fix_wipe_add_user_shares.patch` (3 lines) |
| Submission title | \[P3\] BAM add-user leaves plaintext private key-shares in freed memory (sensitive-data persistency, utils.cpp) |

## Summary

When a new user is added to an existing key, the BAM add-user flow reconstructs the additive private share in a plaintext buffer and builds the new share data from it. Two of these buffers are released to the heap without being zeroed. The 32-byte secret shares therefore remain in freed memory after the operation returns, where any later heap allocation, core dump, or swap write can expose them. The library already owns a zeroing utility (`utils::byte_vector_cleaner`) and uses it elsewhere for exactly this purpose; these two sites were missed. A three-line patch closes both.

## Adversary capability

The finding does not require a malicious protocol peer. It concerns secret material left in the honest party's own address space after a legitimate add-user operation. The disclosure capability assumed is any of:

- A later heap allocation in the same process that reads uninitialised memory (a second, unrelated bug) and returns it on-wire.
- A core dump written after the operation (crash, `abort`, operator capture) that is then read by someone without share-level trust.
- Memory paged to swap, or captured by a VM snapshot or live-migration, on a host where the share store itself is held to a higher trust bar than the page file.

This is reported under §4.2's "sensitive-data memory persistency" sub-category, which §5.3 rates P3 **without** a demonstrated disclosure primitive. The PoC demonstrates the persistency itself; it does not claim a remote read.

## Property at stake

The value left in freed memory is the additive private key share — the exact material §1.2.1 (long-term key secrecy) protects. The library treats this material as needing active erasure: `byte_vector_cleaner` exists precisely to zero share and nonce buffers on scope exit, and the signing and setup paths call it. The add-user path is inconsistent with that established standard, which is what makes this a library defect rather than an integrator concern. It maps directly onto the fourth sub-category of §4.2.

## Root cause

Two buffers in `src/common/cosigner/utils.cpp` hold plaintext share bytes and are freed without zeroing.

**1. `decrypt_and_rebuild_private_share` (\~line 76).** The function decrypts each incoming encrypted share into a `byte_vector_t` and folds it into the running private share:

```cpp
auto share = service.decrypt_message(my_encrypted_share->second);
algebra->add_scalars(algebra, &private_share.data, ..., share.data(), share.size());
// `share` holds the plaintext addend and is destroyed here without zeroing
```

**2. `build_additive_add_user_data` (\~line 127).** The function copies each new player's additive share into `share_bytes` and encrypts it for that player:

```cpp
const byte_vector_t share_bytes(shares[i].data, shares[i].data + sizeof(elliptic_curve256_scalar_t));
data.encrypted_shares[id] = service.encrypt_for_player(id, share_bytes, modulus_it->second);
// `share_bytes` holds the raw share and is destroyed here without zeroing
```

In both cases `std::vector`'s destructor returns the block to the allocator with its contents intact. The signing path handles the identical situation by wrapping such buffers in `utils::byte_vector_cleaner`, which calls `OPENSSL_cleanse` on destruction; these two sites omit it.

## Proof of concept

`poc_add_user_share_not_wiped.cpp` overrides the global `operator delete` so that every freed block is scanned before the allocator reuses it. The scan looks for the exact 32-byte plaintext shares used in the add-user round. The test runs a complete BAM add-user flow on both sides, then reports how many freed blocks still contain a share.

- **Upstream (`00ae08b`):** 2 freed blocks on each side still contain a plaintext share after the operation returns.
- **With `fix_wipe_add_user_shares.patch`:** 0 and 0.

The test is deterministic and runs in a normal Release build — it does not rely on a sanitizer, so it satisfies §4.8. To run: append the test case to `test/cosigner/bam_test.cpp`, rebuild, and run `cosigner_test audit_poc_add_user_share_not_wiped`.

Separately, `generate_add_user_share` has no coverage in the existing BAM test suite, which is how the missing cleanse went unnoticed.

## Severity

**P3 (Medium).** §5.3 lists "sensitive-data memory persistency without a demonstrated disclosure primitive" as P3, and this is that case exactly. The PoC proves the secret persists in freed memory; it does not provide the second bug or the dump-read that would turn persistence into disclosure. If such a primitive were demonstrated, §4.2 would push the pairing higher, but on its own evidence this is P3 and should be submitted as P3 to avoid an over-claim.

It is not P4: P4 memory-persistency items are ones without secret material. Here the material is the long-term share.

## Integrator-contract statement

This finding does not depend on any §2 contract item. The defect is entirely inside the library's own code: `utils.cpp` allocates, fills, and frees the plaintext buffers itself, within a single library call, with no integrator callback in the path that leaves them unwiped. The disclosure scenarios in the adversary section are the integrator's environment, but the persistence of the secret is produced by library code alone — which is the distinction §3 draws between a real library finding and a persistency-contract observation. The fix lives in the library and requires no integrator change.

## Fix

Wrap both buffers in `utils::byte_vector_cleaner` so they are cleansed on scope exit, matching the signing path. Three lines (plus one include):

```diff
+#include "utils/string_utils.h"
 ...
         auto share = service.decrypt_message(my_encrypted_share->second);
+        utils::byte_vector_cleaner share_cleaner(share);
         throw_cosigner_exception(algebra->add_scalars(...));
 ...
-        const byte_vector_t share_bytes(shares[i].data, shares[i].data + sizeof(elliptic_curve256_scalar_t));
+        byte_vector_t share_bytes(shares[i].data, shares[i].data + sizeof(elliptic_curve256_scalar_t));
+        utils::byte_vector_cleaner share_bytes_cleaner(share_bytes);
         data.encrypted_shares[id] = service.encrypt_for_player(id, share_bytes, modulus_it->second);
```

As a durable follow-up, add BAM add-user coverage to `test/cosigner/bam_test.cpp`, and consider a `secure_vector` alias that cleanses by default so new share buffers inherit the behaviour rather than opting in.

## Reproduction

**1. Build the library and tests (upstream, unpatched).**

```bash
git clone https://github.com/fireblocks/mpc-lib && cd mpc-lib
git checkout 00ae08b
sudo apt install build-essential libssl-dev uuid-dev libsecp256k1-dev
mkdir build && cd build && cmake .. && make -j
```

**2. Add the PoC test case.** Append the code below to `test/cosigner/bam_test.cpp`, then rebuild (`make -j cosigner_test` from `build/`).

**3. Run it.**

```bash
./build/test/cosigner/cosigner_test audit_poc_add_user_share_not_wiped
```

**4. Read the result.** Upstream prints 2 freed blocks still holding a plaintext share on each side and the two `CHECK`s fail. Apply `fix_wipe_add_user_shares.patch` (`git apply` at repo root), rebuild, and the same run prints 0 and 0 with both checks passing.

### PoC source — `poc_add_user_share_not_wiped.cpp`

```cpp
// Append to mpc-lib/test/cosigner/bam_test.cpp, rebuild cosigner_test, then run:
//   ./cosigner_test "audit_poc_add_user_share_not_wiped"
// Upstream: 2 / 2 freed blocks still hold plaintext shares. With fix_wipe_add_user_shares.patch: 0 / 0.
// ============================================================================
// AUDIT PoC: plaintext add-user key-share fragments are freed without wiping.
// A replacement global operator delete scans every freed block for the exact
// 32-byte plaintext shares; the test platform "encrypts" by XOR so ciphertexts
// never match. With the library wiping its temporaries, hits would be 0.
// ============================================================================
#include <malloc.h>
#include <atomic>
namespace audit_poc
{
    static std::atomic<bool> g_scan{false};
    static uint8_t g_secrets[16][32];
    static std::atomic<int> g_nsecrets{0};
    static std::atomic<int> g_hits{0};
    static void record(const uint8_t* p, size_t n)
    {
        int i = g_nsecrets.load();
        if (n == 32 && i < 16) { memcpy(g_secrets[i], p, 32); g_nsecrets = i + 1; }
    }
    static void scan(void* p)
    {
        if (!g_scan.load() || !p) return;
        const size_t sz = malloc_usable_size(p);
        const uint8_t* b = (const uint8_t*)p;
        for (int s = 0; s < g_nsecrets.load(); s++)
            for (size_t off = 0; off + 32 <= sz; off++)
                if (memcmp(b + off, g_secrets[s], 32) == 0) { g_hits++; return; }
    }
    struct xor_platform : public test_bam_platform_service
    {
        fbc::byte_vector_t encrypt_for_player(const uint64_t, const fbc::byte_vector_t& data, const std::optional<std::string>& = std::nullopt) const override
        {
            record(data.data(), data.size());               // remember the plaintext share
            fbc::byte_vector_t out(data);
            for (auto& c : out) c ^= 0xAA;                  // "ciphertext" != plaintext
            return out;
        }
        fbc::byte_vector_t decrypt_message(const fbc::byte_vector_t& enc) const override
        {
            fbc::byte_vector_t out(enc);
            for (auto& c : out) c ^= 0xAA;                  // plaintext handed to the library
            return out;
        }
    };
}
void operator delete(void* p) noexcept { audit_poc::scan(p); free(p); }
void operator delete(void* p, size_t) noexcept { audit_poc::scan(p); free(p); }

TEST_CASE("audit_poc_add_user_share_not_wiped")
{
    test_bam_key_persistency_client persistencyClient;
    test_bam_key_persistency_server persistencyServer;
    audit_poc::xor_platform platform;
    fbc::bam_ecdsa_cosigner_server server{ platform, persistencyServer, persistencyServer};
    fbc::bam_ecdsa_cosigner_client client{ platform, persistencyClient, persistencyClient};

    const std::string setup_id = "audit-setup-1", key_id = "audit-key-1", new_key_id = "audit-key-2";
    elliptic_curve256_point_t X1, X2;
    bam_key_generation(setup_id, key_id, client_id, server_id, server, client, ECDSA_SECP256K1, X1, X2);

    const uint64_t new_server = 101, new_client = 102;
    const std::vector<uint64_t> new_ids = { new_server, new_client };
    const std::map<uint64_t, std::string> moduli = { {new_server, ""}, {new_client, ""} };

    // ---- source side: the existing server re-splits its share for the new players
    fbc::bam_ecdsa_cosigner::add_user_data from_server, from_client;
    audit_poc::g_hits = 0; audit_poc::g_scan = true;
    REQUIRE_NOTHROW(server.generate_add_user_share(key_id, new_key_id, ECDSA_SECP256K1, new_ids, moduli, server_id, false, from_server));
    audit_poc::g_scan = false;
    const int sender_hits = audit_poc::g_hits.load();
    REQUIRE_NOTHROW(client.generate_add_user_share(key_id, new_key_id, ECDSA_SECP256K1, new_ids, moduli, client_id, false, from_client));

    // ---- destination side: a NEW server rebuilds its share from both sources
    test_bam_key_persistency_server persistencyServer2;
    fbc::bam_ecdsa_cosigner_server server2{ platform, persistencyServer2, persistencyServer2};
    fbc::bam_ecdsa_cosigner::server_setup_shared_data setup2;
    REQUIRE_NOTHROW(server2.generate_setup_with_proof("audit-setup-2", get_tenant_id(), ECDSA_SECP256K1, setup2));
    std::map<uint64_t, fbc::bam_ecdsa_cosigner::add_user_data> incoming = { {server_id, from_server}, {client_id, from_client} };
    commitments_sha256_t B;
    audit_poc::g_hits = 0; audit_poc::g_scan = true;
    REQUIRE_NOTHROW(server2.add_user_and_commit("audit-setup-2", new_key_id, new_server, new_client, ECDSA_SECP256K1, incoming, B));
    audit_poc::g_scan = false;
    const int receiver_hits = audit_poc::g_hits.load();

    std::cout << "[PoC] plaintext shares recorded: " << audit_poc::g_nsecrets.load() << std::endl;
    std::cout << "[PoC] freed blocks still holding a plaintext share - source side (generate_add_user_share): " << sender_hits << std::endl;
    std::cout << "[PoC] freed blocks still holding a plaintext share - destination side (add_user_and_commit): " << receiver_hits << std::endl;
    CHECK(sender_hits == 0);
    CHECK(receiver_hits == 0);
}
```

## Anticipated triage objections

- The absence of a demonstrated disclosure primitive does not drop this to informational: §5.3 rates "sensitive-data memory persistency **without** a demonstrated disclosure primitive" as P3 by name, and §4.2 lists it as a cryptographic-failure sub-category. The missing primitive is the defining condition of the tier, not a downgrade reason.
- This is not persistency-layer data under §2.1: the buffers are library-internal temporaries in `utils.cpp`, allocated, filled and freed inside a single library call, never handed to the integrator's store — the line §3 draws between a real library finding and a persistency-contract observation.
- The PoC is not sanitizer output under §4.8: it is a deterministic Release-build test using a replacement `operator delete` that scans freed blocks, with a positive result upstream (2/2) and a negative control after the patch (0/0).
- It is not mere hardening: the library already wraps the corresponding buffers in `byte_vector_cleaner` on the signing and setup paths, so these two sites are an omission of an established pattern, not a new request — and the material is the long-term share.
- The XOR "encryption" is only the harness's way to distinguish plaintext from ciphertext; the unwiped buffers belong to the real library code and are independent of what `encrypt_for_player` does.
- No §1.1 all-malicious run or §1.3 host-trust assumption is invoked: the secret persists in the honest party's own process through library code alone.
