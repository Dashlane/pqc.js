#include "aes.h"

void aes_ctr_subtle_crypto(unsigned char *output, const size_t output_len, const unsigned char *input, size_t nblocks, const unsigned char *iv, const unsigned char *sk, const size_t sk_len);

EM_ASYNC_JS(void, aes_ctr_subtle_crypto, (unsigned char *output, const size_t output_len, const unsigned char *input, size_t nblocks, const unsigned char *iv, const unsigned char *sk, const size_t sk_len), {
    const inputJs = new Uint8Array(new Uint8Array(Module.HEAPU8.buffer, input, nblocks << 4));
    const skJs = new Uint8Array(new Uint8Array(Module.HEAPU8.buffer, sk, sk_len));
    const ivJs = new Uint8Array(new Uint8Array(Module.HEAPU8.buffer, iv, 16));

    const key = await Module.subtleCrypto.importKey(
        'raw',
        skJs.buffer,
        'AES-CTR',
        false,
        ['encrypt']
    );

    const outputJs = await Module.subtleCrypto.encrypt(
        {
            name: 'AES-CTR',
            counter: ivJs.buffer,
            length: 32
        },
        key,
        inputJs.buffer
    );
    writeArrayToMemory(new Uint8Array(outputJs).slice(0, output_len), output);
});

void aes128_ecb_keyexp(aes128ctx *r, const unsigned char *key) {
    r->sk = malloc(16);
    memcpy(r->sk, key, 16);
}

void aes128_ecb(unsigned char *out, const unsigned char *in, size_t nblocks, const aes128ctx *ctx) {
    const unsigned char msg[16] = {0};
    for (size_t i=0; i<nblocks; i++) {
        aes_ctr_subtle_crypto(out + (i << 4), 16, msg, 1, in + (i << 4), ctx->sk, 16);
    }
}

void aes128_ctx_release(aes128ctx *r) {
    free(r->sk);
}

void aes256_ecb_keyexp(aes256ctx *r, const unsigned char *key) {
    r->sk = malloc(32);
    memcpy(r->sk, key, 32);
}

void aes256_ctr_keyexp(aes256ctx *r, const unsigned char *key) {
    aes256_ecb_keyexp(r, key);
}

void aes256_ecb(unsigned char *out, const unsigned char *in, size_t nblocks, const aes256ctx *ctx) {
    const unsigned char msg[16] = {0};
    for (size_t i=0; i<nblocks; i++) {
        aes_ctr_subtle_crypto(out + (i << 4), 16, msg, 1, in + (i << 4), ctx->sk, 32);
    }
}

void aes256_ctr(unsigned char *out, const size_t outlen, const unsigned char *nonce, const aes256ctx *ctx) {
    const size_t msg_nblocks = (outlen + 15) >> 4;
    const size_t msg_nbytes = msg_nblocks << 4;

    unsigned char iv[16] = {0};
    memcpy(iv, nonce, 12);

    unsigned char *msg = calloc(msg_nbytes, 1);

    aes_ctr_subtle_crypto(out, outlen, msg, msg_nblocks, iv, ctx->sk, 32);

    free(msg);
}

void aes256_ctx_release(aes256ctx *r) {
    free(r->sk);
}
