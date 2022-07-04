import { PrimitivesTests } from './types/primitives_tests';
import { PrimitivesTests_C } from './types/primitives_tests_c_binding';
import * as createWASMPrimitivesTestsCaller from './primitives_tests.wasm.js'
import * as createJSPrimitivesTestsCaller from './primitives_tests.asm.js'

// https://github.com/emscripten-core/emscripten/issues/11792#issuecomment-877120580
/* nodeblock:start */
import { dirname } from 'path';
import { createRequire } from 'module';
globalThis.__dirname = dirname(import.meta.url);
globalThis.require = createRequire(import.meta.url);
/* nodeblock:end */

async function primitivesTests(useFallback = false): Promise<PrimitivesTests> {
    let Module: PrimitivesTests_C;
    if (useFallback) {
        Module = (await createJSPrimitivesTestsCaller.default()) as unknown as PrimitivesTests_C;
    } else {
        Module = (await createWASMPrimitivesTestsCaller.default()) as unknown as PrimitivesTests_C;
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
        Module.subtleCrypto = window.crypto.subtle;
    }

    const initiated: Promise<void> = Module.ready;

    return {
        run_tests: () => initiated.then(() => {
            return Module.ccall(
                'run_tests',
                'number',
                [],
                [],
                { async: true }
            );
        })
    };
}

export default primitivesTests;
