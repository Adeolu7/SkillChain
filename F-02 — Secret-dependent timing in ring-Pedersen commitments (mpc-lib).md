# F-02 — Secret-dependent timing in ring-Pedersen commitments

Oct 25, 2026 · @Precious Udoessien

| Field | Value |
| --- | --- |
| Target | `fireblocks/mpc-lib` |
| Commit | `00ae08b` (29 July 2026) |
| Component | `ring_pedersen_create_commitment_internal` (`src/common/crypto/commitments/ring_pedersen.c:900`), reached from MtA range-proof generation |
| Category | Side-channel with demonstrated signal (SECURITY-MODEL §4.5) |
| Proposed severity | P3 (Medium), per §5.3 |
| PoC | `rp_timing.c` (in-process) and `rp_timing_net.c` (loopback socket) |
| Fix | Set `BN_FLG_CONSTTIME` on secret exponents; use `BN_mod_exp_mont_consttime` |
| Submission title | \[P3\] Secret key-share used as a variable-time exponent in ring-Pedersen commitments; timing leak demonstrated over the network |

## Summary

During MtA, each party proves a range statement about its secret by forming a ring-Pedersen commitment `s^x · t^r mod N`, where `x` is derived from the party's secret key share. The commitment is computed with `BN_mod_exp2_mont`, which is **not** a constant-time exponentiation: its running time depends on the bit pattern of the secret exponent `x`. The same source file sets `BN_FLG_CONSTTIME` on the secret factors of the modulus during key generation, so the library's own standard is to treat secret exponents as constant-time; this path does not meet it. The leak is measurable not only in-process but across a loopback network socket, which places it in §4.5's "demonstrated signal" category at network-remote attacker access.

## Adversary capability

The attacker is a malicious co-signer within §1.1 — a legitimate protocol peer that completes many signing or presigning sessions with the honest party over time. On each session the honest party computes the ring-Pedersen commitment over an exponent tied to its fixed secret share. The attacker observes the timing of that computation. Because a co-signer is on the other end of the protocol's network channel, the relevant access class is **network-remote**, and §4.5 requires the signal to be demonstrated above realistic noise at that access level — which the network PoC does.

The attacker does not need to break any §1.3 carve-out, does not need all parties malicious, and does not need to deviate from the protocol: honest-but-curious timing observation across normal sessions is sufficient to collect samples.

## Property at stake and §4.5 criteria

The exponent `x` is secret — it is derived from the honest party's long-term key share, so timing that depends on it is a leak about material protected by §1.2.1, not timing on a public value. §4.5 admits a side-channel finding only when **both** conditions hold:

- **The leaked information is secret.** Met: `x` is key-share-derived, not public. (Contrast §6.5, where `is_coprime_fast` runs on public values and is explicitly out of scope.)
- **The signal is demonstrated above realistic noise at the assumed access.** Met: the median timing difference between low- and high-Hamming-weight exponents is reproduced across a loopback TCP socket, timed by a separate process, with the attacker blind to the class (see Measurement).

Both conditions are satisfied, so the finding is in scope under §4.5.

## Root cause

`ring_pedersen_create_commitment_internal` computes the commitment with a two-exponent Montgomery routine:

```c
// ring_pedersen.c:900
if (!BN_mod_exp2_mont(commitment, pub->s, x, pub->t, r, pub->n, ctx, pub->mont))
    goto cleanup;
```

`BN_mod_exp2_mont` performs a simultaneous (interleaved) sliding-window exponentiation. It has no constant-time variant and does not consult `BN_FLG_CONSTTIME`; its multiply/square schedule depends on the bits of both exponents, including the secret `x`. OpenSSL's constant-time path (`BN_mod_exp_mont_consttime`) exists precisely because the ordinary windowed routines leak exponent structure through timing and cache behaviour.

The same file already applies the constant-time discipline to other secrets — `BN_set_flags(..., BN_FLG_CONSTTIME)` on `phi`, `p`, `q`, `lambda` during key generation (lines 86–89, 480, 497). The commitment path is the inconsistent one: `x` arrives from the MtA range-proof generator carrying the key share, and no constant-time flag is set before it reaches `BN_mod_exp2_mont`. The same non-constant-time pattern recurs for other secret exponents in the MtA and Paillier code (`alpha`, `k`, `gamma`, and the primes `p`, `q`).

## Measurement

Both harnesses call the library's own `ring_pedersen_create_commitment` on a 2048-bit modulus. Two secret classes of **identical 256-bit length** are compared: a low-Hamming-weight exponent (\~16 one-bits) and a high-Hamming-weight exponent (\~241 one-bits). Classes are interleaved at random per sample to cancel drift.

**In-process (`rp_timing.c`).** An A/A control (both classes from the same distribution) gives a null result, |t| < 0.5. The A/B test gives a reproducible median shift of \~43–48 µs (\~2%), Welch t up to 5.1. The A/A null rules out measurement bias as the source of the A/B difference.

**Network (`rp_timing_net.c`).** A server process holds the key and computes the commitment; a client process on a separate core times the round trip over a loopback TCP socket (`TCP_NODELAY`) and never sees which class the server used. Loopback is the most favourable network case for an attacker; a real link only adds jitter. The median shift survives, stable across four 8,000-sample runs:

| Run | Low median | High median | Median shift | % |
| --- | --- | --- | --- | --- |
| 1 | 2602.1 µs | 2649.8 µs | 47.8 µs | 1.84% |
| 2 | 2599.9 µs | 2648.2 µs | 48.3 µs | 1.86% |
| 3 | 2595.6 µs | 2644.3 µs | 48.7 µs | 1.88% |
| 4 | 2603.9 µs | 2655.3 µs | 51.4 µs | 1.97% |

The mean-based Welch t is noisier (1.7–7.7 across runs) because loopback jitter is heavy-tailed; the **median** shift is the robust statistic and it is stable to within \~4 µs. A real attack would use a robust estimator over many sessions, exactly as shown.

## Severity

**P3 (Medium).** §5.3 lists "side-channel attacks (§4.5) with a demonstrated signal at modest attacker capability" as P3, which is what this is. The signal is demonstrated; the attacker capability is modest (timing over normal sessions).

Honest limits, stated so triage doesn't have to extract them:

- The demonstrated signal distinguishes **Hamming-weight classes**, not individual bits. It does not by itself recover the 256-bit share; it shows that share-dependent timing exists and is remotely observable.
- Turning this into key recovery would need a finer-grained attack (per-limb or cache-timing) and many sessions. That is why this is P3 and not a §5.1/§5.2 key-extraction claim — no extraction is demonstrated.
- The leak compounds with F-01: offline refresh is the mechanism that re-randomises shares and resets any accumulated leakage, and F-01 makes integrators stop refreshing. That interaction is documented in the main audit report; it raises the long-run risk but does not, on its own, lift this finding to P2.

Submitting as P3 matches the demonstrated evidence and avoids an over-claim that would cost signal.

## Integrator-contract statement

This is a pure library finding with no §2 dependency. The non-constant-time exponentiation is entirely within `ring_pedersen.c`; no integrator callback or storage/transport behaviour is involved. The attacker's timing observation uses the ordinary protocol channel that §2.2 already assumes exists; it does not require the integrator to violate any contract item. The fix is a library change. The one cross-reference an integrator should note is operational, not contractual: pairing this with the F-01 refresh defect increases exposure, so both should be fixed together.

## Fix

Make the secret-exponent path constant-time. Two options:

1. Replace the single `BN_mod_exp2_mont` with two `BN_mod_exp_mont_consttime` calls and one modular multiply: compute `s^x mod N` and `t^r mod N` separately with the constant-time routine, then multiply. This removes the interleaved window entirely.
2. At minimum, set `BN_FLG_CONSTTIME` on `x` (and `r`) before the call, matching what key generation already does for `phi`/`p`/`q`/`lambda`. Note that `BN_mod_exp2_mont` does not honour the flag, so option 1 is the sound fix; option 2 alone is insufficient for this specific routine.

Apply the same discipline to every secret exponent on the MtA and Paillier paths — `alpha`, `k`, `gamma`, and the primes `p`, `q` — wherever they feed `BN_mod_exp`/`BN_mod_exp_mont`. Add a timing regression test built on the A/A-versus-A/B harness so the constant-time property is gated in CI.

## Reproduction

Both harnesses are standalone programs that link against the built `libcosigner`; they are not test cases. Build the library first, then compile each harness against it.

**1. Build the library.**

```bash
git clone https://github.com/fireblocks/mpc-lib && cd mpc-lib
git checkout 00ae08b
sudo apt install build-essential libssl-dev uuid-dev libsecp256k1-dev
mkdir build && cd build && cmake .. && make -j && cd ..
```

**2. Compile the harnesses** (save the two sources below at the repo root):

```bash
# in-process probe
gcc -O2 -Iinclude -Ibuild/src/common rp_timing.c \
    -Lbuild/src/common -lcosigner -lcrypto -lm \
    -Wl,-rpath,$(realpath build/src/common) -o rp_timing

# network probe (loopback socket; _GNU_SOURCE for sched_setaffinity)
gcc -O2 -D_GNU_SOURCE -Iinclude -Ibuild/src/common rp_timing_net.c \
    -Lbuild/src/common -lcosigner -lcrypto -lm \
    -Wl,-rpath,$(realpath build/src/common) -o rp_timing_net
```

**3. Run.**

```bash
taskset -c 1 ./rp_timing 4000 control   # A/A null: |t| should be < 0.5
taskset -c 1 ./rp_timing 4000           # A/B: median shift ~2%, |t| up to ~5
./rp_timing_net 8000                    # network: median shift ~48 us, stable across runs
```

Run the network probe several times and read the **median** shift (robust), not the mean-based t (heavy-tailed over loopback). On a two-core-or-more host the server and client pin to separate cores automatically.

> Note: these numbers were taken on a shared cloud host. Before submission, rerun on the target hardware to confirm the shift holds there; a real network path only increases jitter, so loopback is the attacker's best case.

### Harness source — `rp_timing_net.c` (network)

```c
// F-02 network-remote measurement. A "server" (honest party) holds a ring-Pedersen
// key and, per request, builds a commitment s^x t^r mod N with a secret x whose
// Hamming-weight class the request selects. A "client" (attacker) on a separate core
// times the round trip over a loopback TCP socket and never sees the class.
// Loopback is the MOST favourable network case for an attacker; a real network only
// adds jitter. If the signal does not survive here, it does not survive remotely.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <time.h>
#include <math.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>
#include <sched.h>
#include <openssl/rand.h>
#include "crypto/commitments/ring_pedersen.h"

static double now_ns(void){ struct timespec t; clock_gettime(CLOCK_MONOTONIC_RAW,&t); return t.tv_sec*1e9+t.tv_nsec; }
static int cmpd(const void*a,const void*b){ double x=*(const double*)a,y=*(const double*)b; return (x>y)-(x<y); }
static void pin(int cpu){ cpu_set_t s; CPU_ZERO(&s); CPU_SET(cpu,&s); sched_setaffinity(0,sizeof s,&s); }

static void make_secret(uint8_t x[32], int high){
    if(high){ memset(x,0xFF,32); for(int i=0;i<15;i++){unsigned b;RAND_bytes((uint8_t*)&b,4);b%=255;x[31-b/8]&=~(1u<<(b%8));} }
    else    { memset(x,0,32);    for(int i=0;i<15;i++){unsigned b;RAND_bytes((uint8_t*)&b,4);b%=255;x[31-b/8]|= (1u<<(b%8));} }
    x[0]|=0x80; // fix bit length at 256
}

static ring_pedersen_public_t* g_pub;
static uint8_t* g_out; static uint32_t g_clen;

static void server(int port){
    pin(1);
    int s=socket(AF_INET,SOCK_STREAM,0); int one=1; setsockopt(s,SOL_SOCKET,SO_REUSEADDR,&one,sizeof one);
    struct sockaddr_in a={0}; a.sin_family=AF_INET; a.sin_addr.s_addr=htonl(INADDR_LOOPBACK); a.sin_port=htons(port);
    if(bind(s,(void*)&a,sizeof a)){perror("bind");_exit(1);} listen(s,1);
    int c=accept(s,0,0); setsockopt(c,IPPROTO_TCP,TCP_NODELAY,&one,sizeof one);
    uint8_t r[256+32], cls;
    while(recv(c,&cls,1,MSG_WAITALL)==1){
        uint8_t x[32]; make_secret(x,cls&1); RAND_bytes(r,sizeof r);
        ring_pedersen_create_commitment(g_pub,x,32,r,sizeof r,g_out,g_clen,&g_clen);
        send(c,&cls,1,0); // reply marks completion; attacker only sees timing
    }
    _exit(0);
}

int main(int argc,char**argv){
    const int N = argc>1?atoi(argv[1]):4000;
    int port = 40000 + (getpid()&0x3fff);
    ring_pedersen_private_t* priv;
    if(ring_pedersen_generate_key_pair(2048,&g_pub,&priv)!=RING_PEDERSEN_SUCCESS){puts("keygen failed");return 1;}
    ring_pedersen_create_commitment(g_pub,(uint8_t*)"x",1,(uint8_t*)"r",1,NULL,0,&g_clen); g_out=malloc(g_clen);

    pid_t pid=fork();
    if(pid==0){ server(port); return 0; }
    pin(2);
    usleep(200000);
    int s=socket(AF_INET,SOCK_STREAM,0); int one=1;
    struct sockaddr_in a={0}; a.sin_family=AF_INET; a.sin_addr.s_addr=htonl(INADDR_LOOPBACK); a.sin_port=htons(port);
    while(connect(s,(void*)&a,sizeof a)){ usleep(50000); }
    setsockopt(s,IPPROTO_TCP,TCP_NODELAY,&one,sizeof one);

    double* t[2]={malloc(N*sizeof(double)),malloc(N*sizeof(double))}; int n[2]={0,0};
    for(int w=0;w<300;w++){ uint8_t c=w&1,ack; send(s,&c,1,0); recv(s,&ack,1,MSG_WAITALL); } // warm up
    while(n[0]<N||n[1]<N){
        uint8_t coin; RAND_bytes(&coin,1); int c=coin&1; if(n[c]>=N) c^=1;
        uint8_t cb=c,ack; double t0=now_ns();
        send(s,&cb,1,0); recv(s,&ack,1,MSG_WAITALL);
        t[c][n[c]++]=now_ns()-t0;
    }
    double m[2],v[2],med[2];
    for(int c=0;c<2;c++){ double sm=0,ss=0; for(int i=0;i<N;i++)sm+=t[c][i]; m[c]=sm/N;
        for(int i=0;i<N;i++)ss+=(t[c][i]-m[c])*(t[c][i]-m[c]); v[c]=ss/(N-1);
        qsort(t[c],N,sizeof(double),cmpd); med[c]=t[c][N/2]; }
    double tstat=(m[1]-m[0])/sqrt(v[0]/N+v[1]/N);
    printf("samples/class %d  (loopback RTT, attacker times from a separate core)\n",N);
    printf("LOW  Hamming weight x: median %.1f us, mean %.1f us, sd %.1f us\n",med[0]/1e3,m[0]/1e3,sqrt(v[0])/1e3);
    printf("HIGH Hamming weight x: median %.1f us, mean %.1f us, sd %.1f us\n",med[1]/1e3,m[1]/1e3,sqrt(v[1])/1e3);
    printf("median diff: %.1f us (%.2f%%)  Welch t = %.1f\n",(med[1]-med[0])/1e3,100*(med[1]-med[0])/med[0],tstat);
    printf("verdict: %s\n", fabs(tstat)>4.5?"signal survives network noise (|t|>4.5)":"signal lost in network noise");
    kill(pid,9); return 0;
}
```

### Harness source — `rp_timing.c` (in-process, with A/A control)

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <math.h>
#include <openssl/rand.h>
#include "crypto/commitments/ring_pedersen.h"

static double now_ns(void) { struct timespec t; clock_gettime(CLOCK_MONOTONIC_RAW, &t); return t.tv_sec * 1e9 + t.tv_nsec; }
static int cmpd(const void* a, const void* b) { double x = *(const double*)a, y = *(const double*)b; return (x > y) - (x < y); }

static int g_control = 0;
static void make_secret(uint8_t x[32], int high)
{
    if (g_control) high = 0; // A/A control: both classes drawn from the SAME distribution
    if (high) { memset(x, 0xFF, 32); for (int i = 0; i < 15; i++) { unsigned b; RAND_bytes((uint8_t*)&b, 4); b %= 255; x[31 - b / 8] &= ~(1u << (b % 8)); } }
    else      { memset(x, 0, 32);    for (int i = 0; i < 15; i++) { unsigned b; RAND_bytes((uint8_t*)&b, 4); b %= 255; x[31 - b / 8] |=  (1u << (b % 8)); } }
    x[0] |= 0x80; // fix bit length at exactly 256
}

int main(int argc, char** argv)
{
    const int N = argc > 1 ? atoi(argv[1]) : 4000;
    g_control = argc > 2 && !strcmp(argv[2], "control");
    printf("mode: %s\n", g_control ? "A/A control (same distribution in both classes)" : "A/B (low vs high Hamming weight)");
    ring_pedersen_public_t* pub; ring_pedersen_private_t* priv;
    if (ring_pedersen_generate_key_pair(2048, &pub, &priv) != RING_PEDERSEN_SUCCESS) { puts("keygen failed"); return 1; }
    uint32_t clen = 0; ring_pedersen_create_commitment(pub, (uint8_t*)"x", 1, (uint8_t*)"r", 1, NULL, 0, &clen);
    uint8_t* out = malloc(clen);
    uint8_t r[256 + 32]; // mu ~ N * 2^256, as in mta_range_generate_zkp
    double* t[2] = { malloc(N * sizeof(double)), malloc(N * sizeof(double)) };
    int n[2] = {0, 0};
    for (int w = 0; w < 200; w++) { uint8_t x[32]; make_secret(x, w & 1); RAND_bytes(r, sizeof r); ring_pedersen_create_commitment(pub, x, 32, r, sizeof r, out, clen, &clen); }
    while (n[0] < N || n[1] < N)
    {
        uint8_t coin; RAND_bytes(&coin, 1); int c = coin & 1;
        if (n[c] >= N) c ^= 1;
        uint8_t x[32]; make_secret(x, c); RAND_bytes(r, sizeof r);
        double t0 = now_ns();
        ring_pedersen_create_commitment(pub, x, 32, r, sizeof r, out, clen, &clen);
        t[c][n[c]++] = now_ns() - t0;
    }
    double m[2], v[2], med[2];
    for (int c = 0; c < 2; c++) {
        double s = 0, ss = 0; for (int i = 0; i < N; i++) s += t[c][i]; m[c] = s / N;
        for (int i = 0; i < N; i++) ss += (t[c][i] - m[c]) * (t[c][i] - m[c]); v[c] = ss / (N - 1);
        qsort(t[c], N, sizeof(double), cmpd); med[c] = t[c][N / 2];
    }
    double tstat = (m[1] - m[0]) / sqrt(v[0] / N + v[1] / N);
    printf("samples per class: %d\n", N);
    printf("LOW  Hamming weight x: median %.1f us, mean %.1f us\n", med[0] / 1e3, m[0] / 1e3);
    printf("HIGH Hamming weight x: median %.1f us, mean %.1f us\n", med[1] / 1e3, m[1] / 1e3);
    printf("median difference: %.1f us (%.2f%%)  Welch t = %.1f\n", (med[1] - med[0]) / 1e3, 100 * (med[1] - med[0]) / med[0], tstat);
    printf("verdict: %s\n", fabs(tstat) > 4.5 ? "SECRET-DEPENDENT TIMING (|t| > 4.5)" : "no significant difference");
    return 0;
}
```

## Anticipated triage objections

- The exponent `x` is key-share-derived, so §6.5 (public-value timing) does not apply — this is the opposite, secret-input case, which §4.5's first condition admits.
- §4.5's second condition is met: the network PoC times the operation over a loopback TCP socket from a separate process blind to the class, with a median shift of 47.8–51.4 µs stable across four 8,000-sample runs. Loopback is the attacker's best case; a real link only adds jitter, so a positive result here is the correct direction of evidence.
- It is not a harness artifact: the A/A control (both classes drawn identically) returns |t| < 0.5, and only the secret-dependent A/B condition produces the shift.
- Distinguishing Hamming-weight classes rather than recovering the whole key does not make it informational: §5.3 rates demonstrated side channels at modest attacker capability as P3, and §4.7 states a finding need not be a complete practical attack to be in scope. Full key recovery is the §5.1/§5.2 tier; this is filed as P3.
- `BN_mod_exp2_mont` has no constant-time variant and does not consult `BN_FLG_CONSTTIME` (documented OpenSSL behaviour); the same file sets the flag on `phi`/`p`/`q`/`lambda` at key generation, so the library's own standard is simply not met for `x`.
- No §1.3 carve-out or §2 item assigns constant-time arithmetic to the integrator: the leak is in the library's modular exponentiation, observed on the ordinary protocol channel §2.2 already assumes.
- §4.5 asks for a demonstrated signal at the assumed access level, not an end-to-end key extraction; end-to-end exploitation is what separates P3 from P2/P1, and the submission is filed as P3.
