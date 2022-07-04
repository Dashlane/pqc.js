#ifndef KEM_NAME
    #error "KEM_NAME should be defined"
#elndef KEM_NAME_UPPERCASE
    #error "KEM_NAME_UPPERCASE should be defined"
#endif

#include "utils.h"

#include CONCAT3(PQClean/crypto_kem/,KEM_NAME,/clean/api.h)

#define KEM_PUBLICKEYBYTES CAT(PQCLEAN_,KEM_NAME_UPPERCASE,_CLEAN_CRYPTO_PUBLICKEYBYTES)
#define KEM_SECRETKEYBYTES CAT(PQCLEAN_,KEM_NAME_UPPERCASE,_CLEAN_CRYPTO_SECRETKEYBYTES)
#define KEM_CIPHERTEXTBYTES CAT(PQCLEAN_,KEM_NAME_UPPERCASE,_CLEAN_CRYPTO_CIPHERTEXTBYTES)
#define KEM_BYTES CAT(PQCLEAN_,KEM_NAME_UPPERCASE,_CLEAN_CRYPTO_BYTES)

#define KEM_KEYPAIR CAT(PQCLEAN_,KEM_NAME_UPPERCASE,_CLEAN_crypto_kem_keypair)
#define KEM_ENC CAT(PQCLEAN_,KEM_NAME_UPPERCASE,_CLEAN_crypto_kem_enc)
#define KEM_DEC CAT(PQCLEAN_,KEM_NAME_UPPERCASE,_CLEAN_crypto_kem_dec)

void kem_init() {
    randombytes_stir();
}

int kem_public_key_bytes() {
    return KEM_PUBLICKEYBYTES;
}

int kem_private_key_bytes() {
    return KEM_SECRETKEYBYTES;
}

int kem_ciphertext_bytes() {
    return KEM_CIPHERTEXTBYTES;
}

int kem_shared_secret_bytes() {
    return KEM_BYTES;
}

int kem_keypair(uint8_t *public_key, uint8_t *private_key) {
    return KEM_KEYPAIR(public_key, private_key);
}

int kem_encapsulate(uint8_t *ciphertext, uint8_t *shared_secret, const uint8_t *public_key) {
    return KEM_ENC(ciphertext, shared_secret, public_key);
}

int kem_decapsulate(uint8_t *shared_secret, const uint8_t *ciphertext, const uint8_t *private_key) {
    return KEM_DEC(shared_secret, ciphertext, private_key);
}
