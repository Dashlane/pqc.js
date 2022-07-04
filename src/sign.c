#ifndef SIGN_NAME
    #error "SIGN_NAME should be defined"
#elndef SIGN_NAME_UPPERCASE
    #error "SIGN_NAME_UPPERCASE should be defined"
#endif

#include "utils.h"

#include CONCAT3(PQClean/crypto_sign/,SIGN_NAME,/clean/api.h)

#define SIGN_PUBLICKEYBYTES CAT(PQCLEAN_,SIGN_NAME_UPPERCASE,_CLEAN_CRYPTO_PUBLICKEYBYTES)
#define SIGN_SECRETKEYBYTES CAT(PQCLEAN_,SIGN_NAME_UPPERCASE,_CLEAN_CRYPTO_SECRETKEYBYTES)
#define SIGN_BYTES CAT(PQCLEAN_,SIGN_NAME_UPPERCASE,_CLEAN_CRYPTO_BYTES)

#define SIGN_KEYPAIR CAT(PQCLEAN_,SIGN_NAME_UPPERCASE,_CLEAN_crypto_sign_keypair)
#define SIGN_SIGNATURE CAT(PQCLEAN_,SIGN_NAME_UPPERCASE,_CLEAN_crypto_sign_signature)
#define SIGN_VERIFY CAT(PQCLEAN_,SIGN_NAME_UPPERCASE,_CLEAN_crypto_sign_verify)

void sign_init() {
    randombytes_stir();
}

int sign_public_key_bytes() {
    return SIGN_PUBLICKEYBYTES;
}

int sign_private_key_bytes() {
    return SIGN_SECRETKEYBYTES;
}

int sign_signature_bytes() {
    return SIGN_BYTES;
}

int sign_keypair(uint8_t *public_key, uint8_t *private_key) {
    return SIGN_KEYPAIR(public_key, private_key);
}

#include <stdio.h>

int sign_signature(uint8_t *signature, uint32_t *signature_length, const uint8_t *message, size_t message_length, const uint8_t *private_key) {
    size_t internal_signature_length;
    int result = SIGN_SIGNATURE(signature, &internal_signature_length, message, message_length, private_key);
    *signature_length = internal_signature_length;
    return result;
}

int sign_verify(const uint8_t *signature, size_t signature_length, const uint8_t *message, size_t message_length, const uint8_t *public_key) {
    return SIGN_VERIFY(signature, signature_length, message, message_length, public_key);
}
