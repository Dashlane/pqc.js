# pqc.js

## Overview

This project provides JS bindings and playground of post-quantum asymmetric cipher compiled to WebAssembly using
[emscripten](https://emscripten.org/) with a fallback in plain JS.

The available methods are the finalists (and alternate candidates) of
[NIST Post-Quantum Cryptography Competition](https://csrc.nist.gov/Projects/post-quantum-cryptography):
- **Key Encapsulation Methods (KEM):** [NTRU](https://ntru.org/), [Kyber](https://pq-crystals.org/kyber/), [SABER](https://www.esat.kuleuven.be/cosic/pqcrypto/saber/), [McEliece-Classic](https://classic.mceliece.org/), ([NTRU Prime](https://ntruprime.cr.yp.to/), [FrodoKEM](https://frodokem.org/), [HQC-RMRS](https://pqc-hqc.org/)).
- **Signature methods:** [Dilithium](https://pq-crystals.org/dilithium/), [FALCON](https://falcon-sign.info/), [RAINBOW](https://www.pqcrainbow.org/), ([SPHINCS+](https://sphincs.org/)).

The C implementations used to create the bindings are the `clean` versions provided by [PQClean](https://github.com/PQClean/PQClean).

This project has been inspired by [ntru.js](https://github.com/cyph/ntru.js) that used to provide an NTRU JS binding.

## Playground

It is possible to test the bindings, to compare them in real-world conditions on [this playground](https://dashlane.github.io/pqc.js/).

## How to download pre-built bindings and NPM packages

Pre-built bindings are available on [the playground](https://dashlane.github.io/pqc.js/).

## How to build

- `sudo apt install emscripten`
- `npm ci`
- `make clean`
- `make kem-<the KEM algorithm you want to build>` or `make sign-<the signature algorithm you want to build>`
- All bindings can be built using `make all`

The output directory is `docs/bin/` and each output binding is made of a JS module and its associated WebAssembly file,
a browser package, and a node package.

## How to use

### Key Encapsulation
```typescript
import kemBuilder from 'pqc-kem-<algoName>.js'

async function run() {
    const kem = await kemBuilder();
    
    const { publicKey, privateKey } = await kem.keypair();
    const { ciphertext, sharedSecret: sharedSecretA } = await kem.encapsulate(publicKey);
    const { sharedSecret: sharedSecretB } = await kem.decapsulate(ciphertext, privateKey);
    // sharedSecretA === sharedSecretB
}

run();
```

### Signature
```typescript
import signBuilder from 'pqc-sign-<algoName>.js'

async function run() {
    const sign = await signBuilder();
    
    const message = new Uint8Array([0x44, 0x61, 0x73, 0x68, 0x6c, 0x61, 0x6e, 0x65]);
    
    const { publicKey, privateKey } = await sign.keypair();
    const { signature } = await sign.sign(message, privateKey);
    const validSignature = await sign.verify(signature, message, publicKey);
    // validSignature === true
}

run();
```

### Disable WebAssembly execution

The first optional parameter of the builders is set to `true` is you want to disable WebAssembly execution.

If it is set to false, the fallback JavaScript may still be used if the WebAssembly fails.

### Change the path of the WebAssembly

The second optional parameter of the builders is the path to the WebAssembly file.

## Implementation notes

- Random generation is provided by [libsodium](https://github.com/jedisct1/libsodium) that is using `crypto.randomBytes`.
- `SHA-2` and `AES` implementations are provided by SubtleCrypto that is an implementation of Web Crypto API. This may
slow down the execution of the bindings because of the asynchronous calls to SubtleCrypto, even more when AES-ECB is
used because in this case AES-CTR is called for each block.
- `SHA-2` PQClean implementation is still used by `sphincs-sha256-*` bindings because they are using incremental version
of `sha256` that do not exist in Web Crypto API.
- `SHA-3` PQClean implementation is still used by NTRU, Kyber, SABER, FrodoKEM and McEliece-Classic because there are no
implementations in Web Crypto API.
