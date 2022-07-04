#include <emscripten.h>
#include <stdint.h>
#include <stdlib.h>

EM_ASYNC_JS(void, sha256_subtle_crypto, (uint8_t *output, const uint8_t *input, size_t inlen), {
    const inputJs = new Uint8Array(new Uint8Array(Module.HEAPU8.buffer, input, inlen)).buffer;
    const outputJs = await Module.subtleCrypto.digest('SHA-256', inputJs);
    writeArrayToMemory(new Uint8Array(outputJs), output);
});

void sha256(uint8_t* output, const uint8_t *input, size_t inlen) {
    sha256_subtle_crypto(output, input, inlen);
}

EM_ASYNC_JS(void, sha384_subtle_crypto, (uint8_t *output, const uint8_t *input, size_t inlen), {
    const inputJs = new Uint8Array(new Uint8Array(Module.HEAPU8.buffer, input, inlen)).buffer;
    const outputJs = await Module.subtleCrypto.digest('SHA-384', inputJs);
    writeArrayToMemory(new Uint8Array(outputJs), output);
});

void sha384(uint8_t* output, const uint8_t *input, size_t inlen) {
    sha384_subtle_crypto(output, input, inlen);
}

EM_ASYNC_JS(void, sha512_subtle_crypto, (uint8_t *output, const uint8_t *input, size_t inlen), {
    const inputJs = new Uint8Array(new Uint8Array(Module.HEAPU8.buffer, input, inlen)).buffer;
    const outputJs = await Module.subtleCrypto.digest('SHA-512', inputJs);
    writeArrayToMemory(new Uint8Array(outputJs), output);
});

void sha512(uint8_t* output, const uint8_t *input, size_t inlen) {
    sha512_subtle_crypto(output, input, inlen);
}
