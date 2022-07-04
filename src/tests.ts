import { expect } from 'chai';

import kemBuilder from './kem.js';
import signBuilder from './sign.js';
import primitivesTests from './primitives_tests.js';

describe('KEM tests', () => {

    it('All buffer lengths are valid and shared secret is effectively shared', async () => {
        const kem = await kemBuilder();

        const publicKeyBytes = await kem.publicKeyBytes;
        const privateKeyBytes = await kem.privateKeyBytes;
        const ciphertextBytes = await kem.ciphertextBytes;
        const sharedSecretBytes = await kem.sharedSecretBytes;

        console.log(`Public key length: ${publicKeyBytes} bytes`);
        console.log(`Private key length: ${privateKeyBytes} bytes`);
        console.log(`Ciphertext length: ${ciphertextBytes} bytes`);
        console.log(`Shared secret length: ${sharedSecretBytes} bytes`);

        const { publicKey, privateKey } = await kem.keypair();
        expect(publicKey).length(publicKeyBytes, 'Invalid public key length');
        expect(privateKey).length(privateKeyBytes, 'Invalid private key length');

        const { ciphertext, sharedSecret: sharedSecretA } = await kem.encapsulate(publicKey);
        expect(ciphertext).length(ciphertextBytes, 'Invalid ciphertext length');
        expect(sharedSecretA).length(sharedSecretBytes, 'Invalid A shared secret length');

        const { sharedSecret: sharedSecretB } = await kem.decapsulate(ciphertext, privateKey);
        expect(sharedSecretB).length(sharedSecretBytes, 'Invalid B shared secret length');

        expect(areUint8ArraysEqual(sharedSecretA, sharedSecretB), 'Shared secrets do not match').to.be.true;
    });
});

describe('SIGN tests', () => {
    it('All buffer lengths are valid and generated signature is valid', async () => {
        const sign = await signBuilder();

        const publicKeyBytes = await sign.publicKeyBytes;
        const privateKeyBytes = await sign.privateKeyBytes;
        const signatureBytes = await sign.signatureBytes;

        console.log(`Public key length: ${publicKeyBytes} bytes`);
        console.log(`Private key length: ${privateKeyBytes} bytes`);
        console.log(`Signature length: ${signatureBytes} bytes`);

        const { publicKey, privateKey } = await sign.keypair();
        expect(publicKey).length(publicKeyBytes, 'Invalid public key length');
        expect(privateKey).length(privateKeyBytes, 'Invalid private key length');

        const message = new TextEncoder().encode('This is the message I want to sign');

        const { signature } = await sign.sign(message, privateKey);
        expect(signature.length <= signatureBytes, 'Invalid signature length').to.be.true;

        const validSignature = await sign.verify(signature, message, publicKey);
        expect(validSignature, 'Signature is not valid').to.be.true;
    });
});

describe('PRIMITIVES tests', () => {
    it('Test all modified cryptographic primitive whose implementation have been changed to use WebCrypto', async () => {
        const wasmPrimitivesTests = await primitivesTests(false)
        expect(await wasmPrimitivesTests.run_tests()).eq(0, 'Errors during cryptographic primitives running in WASM')

        const asmPrimitivesTests = await primitivesTests(true)
        expect(await asmPrimitivesTests.run_tests()).eq(0, 'Errors during cryptographic primitives running in asm.js')
    });
});

function areUint8ArraysEqual(arr1: Uint8Array, arr2: Uint8Array): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}
