export type Pointer = number;

export interface PrimitivesTests_C {
    ready: Promise<void>;
    getRandomValue: () => number;
    subtleCrypto: SubtleCrypto;
    HEAPU8: {
        buffer: ArrayBufferLike;
    };

    ccall: (functionName: string, jsReturnType: string, jsArgsTypes: string[], args: any[], async: { async: boolean }) => Promise<any>;

    //_run_tests: Promise<number>;
}
