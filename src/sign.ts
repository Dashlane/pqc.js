import { SIGN_C, Pointer } from './types/sign_c_binding';
import * as createWASMSIGNNativeCaller from './sign.wasm.js';
import * as createJSSIGNNativeCaller from './sign.asm.js';

// https://github.com/emscripten-core/emscripten/issues/11792#issuecomment-877120580
/* nodeblock:start */
import { dirname } from 'path';
import { createRequire } from 'module';
globalThis.__dirname = dirname(import.meta.url);
globalThis.require = createRequire(import.meta.url);
/* nodeblock:end */
{} // So the comment above is not dropped during transpilation

export interface SIGN {
    publicKeyBytes: Promise<number>;
    privateKeyBytes: Promise<number>;
    signatureBytes: Promise<number>;

    keypair: () => Promise<{
        publicKey: Uint8Array;
        privateKey: Uint8Array;
    }>;
    sign: (
        message: Uint8Array,
        publicKey: Uint8Array
    ) => Promise<{
        signature: Uint8Array;
    }>;
    verify: (signature: Uint8Array, message: Uint8Array, privateKey: Uint8Array) => Promise<boolean>;
}

async function signBuilder(useFallback = false, wasmFilePath: string | undefined = undefined): Promise<SIGN> {
    let Module = {} as SIGN_C;

    if (wasmFilePath) {
        Module.locateFile = () => {
            return wasmFilePath;
        }
    }

    if (useFallback) {
        Module = (await createJSSIGNNativeCaller.default(Module)) as unknown as SIGN_C;
    } else {
        try {
            Module = (await createWASMSIGNNativeCaller.default(Module)) as unknown as SIGN_C;
        } catch (err) {
            console.log('Failed to initialize SIGN WASM, using fallback instead');
            Module = (await createJSSIGNNativeCaller.default(Module)) as unknown as SIGN_C;
        }
    }

    // This block is only needed when running on Node.js to avoid usage of `require` in libsodium
    // cf https://github.com/jedisct1/libsodium/issues/1180
    /* nodeblock:start */
    {
        const crypto = await import('crypto');
        const randomValueNodeJS = () => {
            const buf = crypto.randomBytes(4);
            return ((buf[0] << 24) | (buf[1] << 16) | (buf[2] << 8) | buf[3]) >>> 0;
        };
        randomValueNodeJS();
        Module.getRandomValue = randomValueNodeJS;

        // @ts-ignore
        const { subtle } = crypto.webcrypto;
        Module.subtleCrypto = subtle;
    }
    /* nodeblock:end */

    if (!Module.subtleCrypto) {
        Module.subtleCrypto = self.crypto.subtle;
    }

    function dataReturn<T>(returnValue: number, result: T): T {
        if (returnValue === 0) {
            return result;
        } else {
            throw new Error(`SIGN error: ${returnValue}`);
        }
    }

    function dataResult(buffer: Pointer, size: number): Uint8Array {
        return new Uint8Array(new Uint8Array(Module.HEAPU8.buffer, buffer, size));
    }

    function dataFree(buffer: Pointer) {
        try {
            Module._free(buffer);
        } catch (err) {
            setTimeout(() => {
                throw err;
            }, 0);
        }
    }

    let publicKeyBytes: number, privateKeyBytes: number, signatureBytes: number;

    const initiated: Promise<void> = Module.ready.then(() => {
        Module._sign_init();

        publicKeyBytes = Module._sign_public_key_bytes();
        privateKeyBytes = Module._sign_private_key_bytes();
        signatureBytes = Module._sign_signature_bytes();
    });

    return {
        publicKeyBytes: initiated.then(() => {
            return publicKeyBytes;
        }),
        privateKeyBytes: initiated.then(() => {
            return privateKeyBytes;
        }),
        signatureBytes: initiated.then(() => {
            return signatureBytes;
        }),

        keypair: async () => {
            const release = await bindingCallerMutex.lock();
            return initiated.then(async () => {
                const publicKeyBuffer = Module._malloc(publicKeyBytes);
                const privateKeyBuffer = Module._malloc(privateKeyBytes);

                try {
                    const returnValue = await Module.ccall(
                        'sign_keypair',
                        'number',
                        ['number', 'number'],
                        [publicKeyBuffer, privateKeyBuffer],
                        { async: true }
                    );
                    return dataReturn(returnValue, {
                        publicKey: dataResult(publicKeyBuffer, publicKeyBytes),
                        privateKey: dataResult(privateKeyBuffer, privateKeyBytes),
                    });
                } finally {
                    release();
                    dataFree(publicKeyBuffer);
                    dataFree(privateKeyBuffer);
                }
            });
        },

        sign: async (message, privateKey) => {
            const release = await bindingCallerMutex.lock();
            return initiated.then(async () => {
                const signatureBuffer = Module._malloc(signatureBytes);
                const signatureLengthBuffer = Module._malloc(8);
                const messageBuffer = Module._malloc(message.length);
                const privateKeyBuffer = Module._malloc(privateKeyBytes);

                Module.writeArrayToMemory(message, messageBuffer);
                Module.writeArrayToMemory(privateKey, privateKeyBuffer);

                try {
                    const returnValue = await Module.ccall(
                        'sign_signature',
                        'number',
                        ['number', 'number', 'number', 'number', 'number'],
                        [signatureBuffer, signatureLengthBuffer, messageBuffer, message.byteLength, privateKeyBuffer],
                        { async: true }
                    );
                    const realSignatureBytes = new Uint32Array(Module.HEAPU32.buffer, signatureLengthBuffer, 1)[0];
                    return dataReturn(returnValue, {
                        signature: dataResult(signatureBuffer, realSignatureBytes),
                    });
                } finally {
                    release();
                    dataFree(signatureBuffer);
                    dataFree(signatureLengthBuffer);
                    dataFree(messageBuffer);
                    dataFree(privateKeyBuffer);
                }
            });
        },

        verify: async (signature, message, publicKey) => {
            const release = await bindingCallerMutex.lock();
            return initiated.then(async () => {
                const signatureBuffer = Module._malloc(signature.length);
                const messageBuffer = Module._malloc(message.length);
                const publicKeyBuffer = Module._malloc(publicKeyBytes);

                Module.writeArrayToMemory(signature, signatureBuffer);
                Module.writeArrayToMemory(message, messageBuffer);
                Module.writeArrayToMemory(publicKey, publicKeyBuffer);

                try {
                    const returnValue = await Module.ccall(
                        'sign_verify',
                        'number',
                        ['number', 'number', 'number', 'number', 'number'],
                        [signatureBuffer, signature.byteLength, messageBuffer, message.byteLength, publicKeyBuffer],
                        { async: true }
                    );
                    return returnValue === 0;
                } finally {
                    release();
                    dataFree(signatureBuffer);
                    dataFree(messageBuffer);
                    dataFree(publicKeyBuffer);
                }
            });
        },
    };
}

// Taken from https://stackoverflow.com/questions/51086688/mutex-in-javascript-does-this-look-like-a-correct-implementation
class Mutex {
    current: Promise<void>;

    constructor() {
        this.current = Promise.resolve();
    }

    lock() {
        let _resolve: () => void;
        const p = new Promise<void>(resolve => {
            _resolve = () => resolve();
        });
        const rv = this.current.then(() => _resolve);
        this.current = p;
        return rv;
    }
}

// Only one call to the library can fly at once, the mutex below restricts the number of concurrent calls
const bindingCallerMutex = new Mutex();

export default signBuilder;
