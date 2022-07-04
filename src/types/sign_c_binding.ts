export type Pointer = number;

export interface SIGN_C {
    ready: Promise<void>;
    getRandomValue: () => number;
    subtleCrypto: SubtleCrypto;
    locateFile?: (path: string, scriptDirectory: string) => string;
    HEAPU8: {
        buffer: ArrayBufferLike;
    };
    HEAPU32: {
        buffer: ArrayBufferLike;
    };

    ccall: (functionName: string, jsReturnType: string, jsArgsTypes: string[], args: any[], async: { async: boolean }) => Promise<any>;
    writeArrayToMemory: (array: Uint8Array, buffer: Pointer) => void;
    _malloc: (size: number) => Pointer;
    _free: (buffer: Pointer) => void;

    _sign_init: () => void;

    _sign_public_key_bytes: () => number;
    _sign_private_key_bytes: () => number;
    _sign_signature_bytes: () => number;

    //_sign_keypair: (publicKeyBuffer: Pointer, privateKeyBuffer: Pointer) => number;
    /*_sign_signature: (
        signature: Pointer,
        signatureLength: Pointer,
        message: Pointer,
        messageLength: number,
        privateKey: Pointer
    ) => number;*/
    /*_sign_verify: (
        signature: Pointer,
        signatureLength: number,
        message: Pointer,
        messageLength: number,
        publicKey: Pointer
    ) => number;*/
}
