export type Pointer = number;

export interface KEM_C {
    ready: Promise<void>;
    getRandomValue: () => number;
    subtleCrypto: SubtleCrypto;
    locateFile?: (path: string, scriptDirectory: string) => string;
    HEAPU8: {
        buffer: ArrayBufferLike;
    };

    ccall: (functionName: string, jsReturnType: string, jsArgsTypes: string[], args: any[], async: { async: boolean }) => Promise<any>;
    writeArrayToMemory: (array: Uint8Array, buffer: Pointer) => void;
    _malloc: (size: number) => Pointer;
    _free: (buffer: Pointer) => void;

    _kem_init: () => void;

    _kem_public_key_bytes: () => number;
    _kem_private_key_bytes: () => number;
    _kem_ciphertext_bytes: () => number;
    _kem_shared_secret_bytes: () => number;

    //_kem_keypair: (publicKeyBuffer: Pointer, privateKeyBuffer: Pointer) => number;
    //_kem_encapsulate: (ciphertextBuffer: Pointer, sharedSecretBuffer: Pointer, publicKeyBuffer: Pointer) => number;
    //_kem_decapsulate: (sharedSecretBuffer: Pointer, ciphertextBuffer: Pointer, privateKeyBuffer: Pointer) => number;
}
