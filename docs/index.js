const kemNames = {
    'Kyber': ['kyber512', 'kyber512-90s', 'kyber768', 'kyber768-90s', 'kyber1024', 'kyber1024-90s'],
    'Mc-Eliece': ['mceliece348864', 'mceliece348864f', 'mceliece460896', 'mceliece460896f', 'mceliece6688128', 'mceliece6688128f', 'mceliece6960119', 'mceliece6960119f', 'mceliece8192128', 'mceliece8192128f'],
    'NTRU': ['ntruhps2048509', 'ntruhps2048677', 'ntruhps4096821', 'ntruhps40961229', 'ntruhrss701', 'ntruhrss1373'],
    'SABER': ['lightsaber', 'saber', 'firesaber'],
    'FrodoKEM': ['frodokem640aes', 'frodokem640shake', 'frodokem976aes', 'frodokem976shake', 'frodokem1344aes', 'frodokem1344shake'],
    'HQC-RMRS': ['hqc-rmrs-128', 'hqc-rmrs-192', 'hqc-rmrs-256'],
    'NTRU Prime': ['ntrulpr653', 'ntrulpr761', 'ntrulpr857', 'ntrulpr953', 'ntrulpr1013', 'ntrulpr1277', 'sntrup653', 'sntrup761', 'sntrup857', 'sntrup953', 'sntrup1013', 'sntrup1277']
};
let kemImplementations = {};

const signNames = {
    'Dilithium': ['dilithium2', 'dilithium2aes', 'dilithium3', 'dilithium3aes', 'dilithium5', 'dilithium5aes'],
    'FALCON': ['falcon-512', 'falcon-1024'],
    'Rainbow': ['rainbowI-circumzenithal', 'rainbowI-classic', 'rainbowI-compressed', 'rainbowIII-circumzenithal', 'rainbowIII-classic', 'rainbowIII-compressed', 'rainbowV-circumzenithal', 'rainbowV-classic', 'rainbowV-compressed'],
    'SPHINCS+': ['sphincs-haraka-128f-robust', 'sphincs-haraka-128f-simple', 'sphincs-haraka-128s-robust', 'sphincs-haraka-128s-simple', 'sphincs-haraka-192f-robust', 'sphincs-haraka-192f-simple', 'sphincs-haraka-192s-robust', 'sphincs-haraka-192s-simple', 'sphincs-haraka-256f-robust', 'sphincs-haraka-256f-simple', 'sphincs-haraka-256s-robust', 'sphincs-haraka-256s-simple', 'sphincs-sha256-128f-robust', 'sphincs-sha256-128f-simple', 'sphincs-sha256-128s-robust', 'sphincs-sha256-128s-simple', 'sphincs-sha256-192f-robust', 'sphincs-sha256-192f-simple', 'sphincs-sha256-192s-robust', 'sphincs-sha256-192s-simple', 'sphincs-sha256-256f-robust', 'sphincs-sha256-256f-simple', 'sphincs-sha256-256s-robust', 'sphincs-sha256-256s-simple', 'sphincs-shake256-128f-robust', 'sphincs-shake256-128f-simple', 'sphincs-shake256-128s-robust', 'sphincs-shake256-128s-simple', 'sphincs-shake256-192f-robust', 'sphincs-shake256-192f-simple', 'sphincs-shake256-192s-robust', 'sphincs-shake256-192s-simple', 'sphincs-shake256-256f-robust', 'sphincs-shake256-256f-simple', 'sphincs-shake256-256s-robust', 'sphincs-shake256-256s-simple']
};
let signImplementations = {};

async function getKEMImplementation(kemName) {
    if (!kemImplementations[kemName]) {
        const deactivateWASMState = document.getElementById('deactivate-wasm-state').checked;
        console.log(`${kemName} KEM algo loaded! Deactivation of WASM code state is ${deactivateWASMState}.`);
        kemImplementations[kemName] = (await import('./bin/pqc-kem-' + kemName + '/pqc-kem-' + kemName + '.js')).default(deactivateWASMState);
    }
    return kemImplementations[kemName];
}

async function getSIGNImplementation(signName) {
    if (!signImplementations[signName]) {
        const deactivateWASMState = document.getElementById('deactivate-wasm-state').checked;
        console.log(`${signName} SIGN algo loaded! Deactivation of WASM code state is ${deactivateWASMState}.`);
        signImplementations[signName] = (await import('./bin/pqc-sign-' + signName + '/pqc-sign-' + signName + '.js')).default(deactivateWASMState);
    }
    return signImplementations[signName];
}

function onLoad() {
    document.getElementById('navbarDropdownOptionsKEM').innerHTML = Object.keys(kemNames).map(kemCategory => {
        const subKEMNames = kemNames[kemCategory].map(kemName => `<li><a class="dropdown-item" onclick="clickOnSubmenuLink($(this)); displayKEM('${kemName}')" href="#">${kemName}</a></li>`).join('\n');
        return `
<li class="dropdown-submenu">
    <a class="dropdown-item dropdown-toggle" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" href="#">${kemCategory}</a>
    <ul class="dropdown-menu">
        ${subKEMNames}
    </ul>
</li>
        `;
    }).join('\n');
    document.getElementById('navbarDropdownOptionsSIGN').innerHTML = Object.keys(signNames).map(signCategory => {
        const subSIGNNames = signNames[signCategory].map(signName => `<li><a class="dropdown-item" onclick="clickOnSubmenuLink($(this)); displaySIGN('${signName}')" href="#">${signName}</a></li>`).join('\n');
        return `
<li class="dropdown-submenu">
    <a class="dropdown-item dropdown-toggle" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" href="#">${signCategory}</a>
    <ul class="dropdown-menu">
        ${subSIGNNames}
    </ul>
</li>
        `;
    }).join('\n');

    const bodySelector = $('body');

    bodySelector.tooltip({
        selector: '.btn-tooltip'
    });

    bodySelector.on('click', '.btn-clipboard', async function() {
        const relatedInputContext = $(this).prev()[0].value;
        await navigator.clipboard.writeText(relatedInputContext);
        let tooltipID = $(this).attr('aria-describedby');
        $('#'+tooltipID).find('.tooltip-inner').html('Copied');
    }).on('mouseout', '.btn-clipboard', function() {
        let tooltipID = $(this).attr('aria-describedby');
        $('#'+tooltipID).find('.tooltip-inner').html('Click to copy');
    });

    displayHome();
}
window.onLoad = onLoad;

function displayHome() {
    document.getElementById('body-content').innerHTML = `
<h1 class="mt-5">Post-Quantum Cryptography Playground</h1>
<p class="lead">
    Playground to test JavaScript bindings of each round-3 finalists (and alternate candidates) of <a href="https://csrc.nist.gov/Projects/post-quantum-cryptography">NIST Post-Quantum Cryptography Competition</a>.
</p>
<p><b>Supported Key Encapsulation Methods (KEM):</b> NTRU, Kyber, SABER, McEliece-Classic, (NTRU Prime, FrodoKEM, HQC-RMRS).</p>
<p><b>Supported Signature methods:</b> Dilithium, FALCON, RAINBOW, (SPHINCS+).</p>
<p>It is possible to deactivate WebAssembly and use the fallback JS bindings instead by enabling the checkbox at the top right.</p>
<p class="lead">More information on the <a href="https://github.com/Dashlane/pqc.js/">GitHub page</a>.</p>
    `;
}
window.displayHome = displayHome;

async function displayKEM(kemName) {
    document.getElementById("body-content").innerHTML = `
<h1 class="mt-5">
    Key encapsulation algorithm – ${kemName.replaceAll('-', '&#8209;')}
    <div class="m-2 btn btn-outline-primary btn-tooltip" data-bs-toggle="tooltip" title="Run all functions" onclick="kem_run_all('${kemName}')">
        <i class="p-3 fa fa-dice fa-2xl" aria-hidden="true"></i>
    </div>
</h1>
<span>Browser package size: </span>
<span id="kem-library-size">loading...</span><br />
<a class="btn btn-outline-primary" role="button" href="./bin/pqc-kem-${kemName}/pqc-kem-${kemName}.js" download="" target="_blank">
    Download standalone JS...
</a>
<a class="btn btn-outline-primary" role="button" href="./bin/pqc-kem-${kemName}/pqc-kem-${kemName}.wasm" download="" target="_blank">
    ...and WASM
</a>
<a class="btn btn-outline-primary" role="button" href="./bin/pqc-kem-${kemName}/pqc-kem-${kemName}-browser.tgz" download="" target="_blank">
    Download browser package
</a>
<a class="btn btn-outline-primary" role="button" href="./bin/pqc-kem-${kemName}/pqc-kem-${kemName}-node.tgz" download="" target="_blank">
    Download node package
</a>

<!-- keypair -->
<h2 class="mt-5">Generate pair of keys</h2>
<form class="m-3 function-form" onsubmit="kem_keypair('${kemName}'); return false">
<div class="m-3">
<div class="row">
<div class="col col-md-6 offset-md-6">
<div class="p-2">
    <label for="kem_keypair_pk" class="form-label">Public key</label>
    <div class="input-group">
        <input type="text" id="kem_keypair_pk" class="form-control" aria-describedby="kem_keypair_pk_bytes" readonly/>
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="kem_keypair_pk_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="row">
<div class="col col-md-6 offset-md-6">
<div class="p-2">
    <label for="kem_keypair_sk" class="form-label">Private key</label>
    <div class="input-group">
        <input type="text" id="kem_keypair_sk" class="form-control" aria-describedby="kem_keypair_sk_bytes" readonly/>
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="kem_keypair_sk_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="d-flex flex-row-reverse px-2">
    <div class="align-self-center py-2">
        <button type="submit" class="btn btn-outline-primary"><div class="m-1">Compute</div></button>
    </div>
    <div class="col-md-9 align-self-center px-3">
        <div class="text-secondary float-end">Previous computation in&nbsp;<span id="kem_keypair_timing">0</span> ms</div>
    </div>
</div>
</div>
</form>

<!-- encapsulate -->
<h2 class="mt-5">Encapsulate a secret</h2>
<form class="m-3 function-form" onsubmit="kem_encapsulate('${kemName}'); return false">
<div class="m-3">
<div class="row">
<div class="col col-md-6">
<div class="p-2">
    <label for="kem_encapsulate_pk" class="form-label">Public key</label>
    <div class="input-group">
        <input type="text" id="kem_encapsulate_pk" class="form-control" aria-describedby="kem_encapsulate_pk_bytes" />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="kem_encapsulate_pk_bytes" class="form-text">0 bytes</span>
</div>
</div>
<div class="col col-md-6">
<div class="p-2">
    <label for="kem_encapsulate_ct" class="form-label">Ciphertext</label>
    <div class="input-group">
        <input type="text" id="kem_encapsulate_ct" class="form-control" aria-describedby="kem_encapsulate_ct_bytes" readonly />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="kem_encapsulate_ct_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="row">
<div class="col col-md-6 offset-md-6">
<div class="p-2">
    <label for="kem_encapsulate_ss" class="form-label">Shared secret</label>
    <div class="input-group">
        <input type="text" id="kem_encapsulate_ss" class="form-control" aria-describedby="kem_encapsulate_ss_bytes" readonly/>
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="kem_encapsulate_ss_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="d-flex flex-row-reverse px-2">
    <div class="align-self-center py-2">
        <button type="submit" class="btn btn-outline-primary"><div class="m-1">Compute</div></button>
    </div>
    <div class="col-md-9 align-self-center px-3">
        <div class="text-secondary float-end">Previous computation in&nbsp;<span id="kem_encapsulate_timing">0</span> ms</div>
    </div>
</div>
</div>
</form>

<!-- decapsulate -->
<h2 class="mt-5">Decapsulate a secret</h2>
<form class="m-3 function-form" onsubmit="kem_decapsulate('${kemName}'); return false">
<div class="m-3">
<div class="row">
<div class="col col-md-6">
<div class="p-2">
    <label for="kem_decapsulate_sk" class="form-label">Private key</label>
    <div class="input-group">
        <input type="text" id="kem_decapsulate_sk" class="form-control" aria-describedby="kem_decapsulate_sk_bytes" />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="kem_decapsulate_sk_bytes" class="form-text">0 bytes</span>
</div>
</div>
<div class="col col-md-6">
<div class="p-2">
    <label for="kem_decapsulate_ss" class="form-label">Shared secret</label>
    <div class="input-group">
        <input type="text" id="kem_decapsulate_ss" class="form-control" aria-describedby="kem_decapsulate_ss_bytes" readonly />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="kem_decapsulate_ss_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="row">
<div class="col col-md-6">
<div class="p-2">
    <label for="kem_decapsulate_ct" class="form-label">Ciphertext</label>
    <div class="input-group">
        <input type="text" id="kem_decapsulate_ct" class="form-control" aria-describedby="kem_decapsulate_ct_bytes" />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="kem_decapsulate_ct_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="d-flex flex-row-reverse px-2">
    <div class="align-self-center py-2">
        <button type="submit" class="btn btn-outline-primary"><div class="m-1">Compute</div></button>
    </div>
    <div class="col-md-9 align-self-center px-3">
        <div class="text-secondary float-end">Previous computation in&nbsp;<span id="kem_decapsulate_timing">0</span> ms</div>
    </div>
</div>
</div>
</form>
        `;

    displayFileSize('./bin/pqc-kem-' + kemName + '/pqc-kem-' + kemName + '-browser.tgz', 'kem-library-size');

    const kem = await getKEMImplementation(kemName);

    addBytesCounter('kem_keypair_pk', 'kem_keypair_pk_bytes', await kem.publicKeyBytes);
    addBytesCounter('kem_keypair_sk', 'kem_keypair_sk_bytes', await kem.privateKeyBytes);

    addBytesCounter('kem_encapsulate_pk', 'kem_encapsulate_pk_bytes', await kem.publicKeyBytes);
    addBytesCounter('kem_encapsulate_ct', 'kem_encapsulate_ct_bytes', await kem.ciphertextBytes);
    addBytesCounter('kem_encapsulate_ss', 'kem_encapsulate_ss_bytes', await kem.sharedSecretBytes);

    addBytesCounter('kem_decapsulate_sk', 'kem_decapsulate_sk_bytes', await kem.privateKeyBytes);
    addBytesCounter('kem_decapsulate_ct', 'kem_decapsulate_ct_bytes', await kem.ciphertextBytes);
    addBytesCounter('kem_decapsulate_ss', 'kem_decapsulate_ss_bytes', await kem.sharedSecretBytes);

    checkInputEquality('kem_encapsulate_ss', 'kem_decapsulate_ss');
}
window.displayKEM = displayKEM;

async function kem_keypair(kemName) {
    const kem = await getKEMImplementation(kemName);
    const timingPlaceholder = document.getElementById('kem_keypair_timing');
    timingPlaceholder.innerHTML = '0';

    const startTime = new Date();
    const { publicKey, privateKey } = await kem.keypair();
    const elapsedTimeMs = new Date() - startTime;
    timingPlaceholder.innerHTML = `${elapsedTimeMs}`;

    const publicKeyBase64 = _arrayBufferToBase64(publicKey);
    setInputValueAndUpdate('kem_keypair_pk', publicKeyBase64);
    setInputValueAndUpdate('kem_encapsulate_pk', publicKeyBase64);

    const privateKeyBase64 = _arrayBufferToBase64(privateKey);
    setInputValueAndUpdate('kem_keypair_sk', privateKeyBase64);
    setInputValueAndUpdate('kem_decapsulate_sk', privateKeyBase64);
}
window.kem_keypair = kem_keypair;

async function kem_encapsulate(kemName) {
    const kem = await getKEMImplementation(kemName);
    const timingPlaceholder = document.getElementById('kem_encapsulate_timing');
    timingPlaceholder.innerHTML = '0';

    const publicKey = _base64ToArrayBuffer(document.getElementById('kem_encapsulate_pk').value);
    if (publicKey.byteLength !== await kem.publicKeyBytes) {
        console.error(`KEM-Encapsulate> Invalid public key length: got ${publicKey.byteLength} bytes, expected ${await kem.publicKeyBytes}`);
        return;
    }

    const startTime = new Date();
    const { ciphertext, sharedSecret } = await kem.encapsulate(publicKey);
    const elapsedTimeMs = new Date() - startTime;
    timingPlaceholder.innerHTML = `${elapsedTimeMs}`;

    const ciphertextBase64 = _arrayBufferToBase64(ciphertext);
    setInputValueAndUpdate('kem_encapsulate_ct', ciphertextBase64);
    setInputValueAndUpdate('kem_decapsulate_ct', ciphertextBase64);

    const sharedSecretBase64 = _arrayBufferToBase64(sharedSecret);
    setInputValueAndUpdate('kem_encapsulate_ss', sharedSecretBase64);
}
window.kem_encapsulate = kem_encapsulate;

async function kem_decapsulate(kemName) {
    const kem = await getKEMImplementation(kemName);
    const timingPlaceholder = document.getElementById('kem_decapsulate_timing');
    timingPlaceholder.innerHTML = '0';

    const privateKey = _base64ToArrayBuffer(document.getElementById('kem_decapsulate_sk').value);
    const ciphertext = _base64ToArrayBuffer(document.getElementById('kem_decapsulate_ct').value);
    if (privateKey.byteLength !== await kem.privateKeyBytes) {
        console.error(`KEM-Decapsulate> Invalid private key length: got ${privateKey.byteLength} bytes, expected ${await kem.privateKeyBytes}`);
        return;
    }
    if (ciphertext.byteLength !== await kem.ciphertextBytes) {
        console.error(`KEM-Decapsulate> Invalid ciphertext key length: got ${ciphertext.byteLength} bytes, expected ${await kem.ciphertextBytes}`);
        return;
    }

    const startTime = new Date();
    const { sharedSecret } = await kem.decapsulate(ciphertext, privateKey);
    const elapsedTimeMs = new Date() - startTime;
    timingPlaceholder.innerHTML = `${elapsedTimeMs}`;

    const sharedSecretBase64 = _arrayBufferToBase64(sharedSecret);
    setInputValueAndUpdate('kem_decapsulate_ss', sharedSecretBase64);
}
window.kem_decapsulate = kem_decapsulate;

async function kem_run_all(kemName) {
    await kem_keypair(kemName);
    await kem_encapsulate(kemName);
    await kem_decapsulate(kemName);
}
window.kem_run_all = kem_run_all;

async function displaySIGN(signName) {
    document.getElementById("body-content").innerHTML = `
<h1 class="mt-5">
    Signature algorithm – ${signName}
    <div class="m-2 btn btn-outline-primary btn-tooltip" data-bs-toggle="tooltip" title="Run all functions" onclick="sign_run_all('${signName}')">
        <i class="p-3 fa fa-dice fa-2xl" aria-hidden="true"></i>
    </div>
</h1>
<span>Browser library size: </span>
<span id="sign-library-size">loading...</span><br />
<a class="btn btn-outline-primary" role="button" href="./bin/pqc-sign-${signName}/pqc-sign-${signName}.js" download="" target="_blank">
    Download standalone JS...
</a>
<a class="btn btn-outline-primary" role="button" href="./bin/pqc-sign-${signName}/pqc-sign-${signName}.wasm" download="" target="_blank">
    ...and WASM
</a>
<a class="btn btn-outline-primary" role="button" href="./bin/pqc-sign-${signName}/pqc-sign-${signName}-browser.tgz" download="" target="_blank">
    Download browser package
</a>
<a class="btn btn-outline-primary" role="button" href="./bin/pqc-sign-${signName}/pqc-sign-${signName}-node.js" download="" target="_blank">
    Download node package
</a>

<!-- keypair -->
<h2 class="mt-5">Generate pair of keys</h2>
<form class="m-3 function-form" onsubmit="sign_keypair('${signName}'); return false">
<div class="m-3">
<div class="row">
<div class="col col-md-6 offset-md-6">
<div class="p-2">
    <label for="sign_keypair_pk" class="form-label">Public key</label>
    <div class="input-group">
        <input type="text" id="sign_keypair_pk" class="form-control" aria-describedby="sign_keypair_pk_bytes" readonly/>
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="sign_keypair_pk_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="row">
<div class="col col-md-6 offset-md-6">
<div class="p-2">
    <label for="sign_keypair_sk" class="form-label">Private key</label>
    <div class="input-group">
        <input type="text" id="sign_keypair_sk" class="form-control" aria-describedby="sign_keypair_sk_bytes" readonly/>
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="sign_keypair_sk_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="d-flex flex-row-reverse px-2">
    <div class="align-self-center py-2">
        <button type="submit" class="btn btn-outline-primary"><div class="m-1">Compute</div></button>
    </div>
    <div class="col-md-9 align-self-center px-3">
        <div class="text-secondary float-end">Previous computation in&nbsp;<span id="sign_keypair_timing">0</span> ms</div>
    </div>
</div>
</div>
</form>

<!-- sign -->
<h2 class="mt-5">Sign a message</h2>
<form class="m-3 function-form" onsubmit="sign_sign('${signName}'); return false">
<div class="m-3">
<div class="row">
<div class="col col-md-6">
<div class="p-2">
    <label for="sign_sign_sk" class="form-label">Secret key</label>
    <div class="input-group">
        <input type="text" id="sign_sign_sk" class="form-control" aria-describedby="sign_sign_sk_bytes" />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="sign_sign_sk_bytes" class="form-text">0 bytes</span>
</div>
</div>
<div class="col col-md-6">
<div class="p-2">
    <label for="sign_sign_sign" class="form-label">Signature</label>
    <div class="input-group">
        <input type="text" id="sign_sign_sign" class="form-control" aria-describedby="sign_sign_sign_bytes" readonly />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="sign_sign_sign_bytes" class="form-text">0 bytes</span>
    <span class="form-text">(max ${await (await getSIGNImplementation(signName)).signatureBytes})</span>
</div>
</div>
</div>
<div class="row">
<div class="col col-md-6">
<div class="p-2">
    <label for="sign_sign_msg" class="form-label">Message</label>
    <div class="input-group">
        <input type="text" id="sign_sign_msg" class="form-control" aria-describedby="sign_sign_msg_bytes" />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
</div>
</div>
</div>
<div class="d-flex flex-row-reverse px-2">
    <div class="align-self-center py-2">
        <button type="submit" class="btn btn-outline-primary"><div class="m-1">Compute</div></button>
    </div>
    <div class="col-md-9 align-self-center px-3">
        <div class="text-secondary float-end">Previous computation in&nbsp;<span id="sign_sign_timing">0</span> ms</div>
    </div>
</div>
</div>
</form>

<!-- verify -->
<h2 class="mt-5">Verify a signature</h2>
<form class="m-3 function-form" onsubmit="sign_verify('${signName}'); return false">
<div class="m-3">
<div class="row">
<div class="col col-md-6">
<div class="p-2">
    <label for="sign_verify_pk" class="form-label">Public key</label>
    <div class="input-group">
        <input type="text" id="sign_verify_pk" class="form-control" aria-describedby="sign_verify_pk_bytes" />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="sign_verify_pk_bytes" class="form-text">0 bytes</span>
</div>
</div>
</div>
<div class="row">
<div class="col col-md-6">
<div class="p-2">
    <label for="sign_verify_msg" class="form-label">Message</label>
    <div class="input-group">
        <input type="text" id="sign_verify_msg" class="form-control" aria-describedby="sign_verify_msg_bytes" />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
</div>
</div>
</div>
<div class="row">
<div class="col col-md-6">
<div class="p-2">
    <label for="sign_verify_sign" class="form-label">Signature</label>
    <div class="input-group">
        <input type="text" id="sign_verify_sign" class="form-control" aria-describedby="sign_verify_sign_bytes" />
        <div class="input-group-text btn btn-tooltip btn-clipboard" data-bs-toggle="tooltip" title="Click to copy">
            <i class="fa fa-clipboard" aria-hidden="true"></i>
        </div>
    </div>
    <span id="sign_verify_sign_bytes" class="form-text">0 bytes</span>
    <span class="form-text">(max ${await (await getSIGNImplementation(signName)).signatureBytes})</span>
</div>
</div>
</div>
<div class="d-flex flex-row-reverse px-2">
    <div class="align-self-center py-2">
        <button type="submit" class="btn btn-outline-primary"><div class="m-1">Compute</div></button>
    </div>
    <div class="col-md-9 align-self-center px-3">
        <div class="text-secondary float-end">Previous computation in&nbsp;<span id="sign_verify_timing">0</span> ms</div>
    </div>
</div>
</div>
</form>
        `;

    displayFileSize('./bin/pqc-sign-' + signName + '/pqc-sign-' + signName + '-browser.tgz', 'sign-library-size');

    const sign = await getSIGNImplementation(signName);

    addBytesCounter('sign_keypair_pk', 'sign_keypair_pk_bytes', await sign.publicKeyBytes);
    addBytesCounter('sign_keypair_sk', 'sign_keypair_sk_bytes', await sign.privateKeyBytes);

    addBytesCounter('sign_sign_sk', 'sign_sign_sk_bytes', await sign.privateKeyBytes);
    addBytesCounter('sign_sign_sign', 'sign_sign_sign_bytes', await sign.signatureBytes, true);

    addBytesCounter('sign_verify_pk', 'sign_verify_pk_bytes', await sign.publicKeyBytes);
    addBytesCounter('sign_verify_sign', 'sign_verify_sign_bytes', await sign.signatureBytes, true);
    document.getElementById('sign_verify_sign').addEventListener('input', e => {
        e.target.style.color = '';
    });
}
window.displaySIGN = displaySIGN;

async function sign_keypair(signName) {
    const sign = await getSIGNImplementation(signName);
    const timingPlaceholder = document.getElementById('sign_keypair_timing');
    timingPlaceholder.innerHTML = '0';

    const startTime = new Date();
    const { publicKey, privateKey } = await sign.keypair();
    const elapsedTimeMs = new Date() - startTime;
    timingPlaceholder.innerHTML = `${elapsedTimeMs}`;

    const publicKeyBase64 = _arrayBufferToBase64(publicKey);
    setInputValueAndUpdate('sign_keypair_pk', publicKeyBase64);
    setInputValueAndUpdate('sign_verify_pk', publicKeyBase64);

    const privateKeyBase64 = _arrayBufferToBase64(privateKey);
    setInputValueAndUpdate('sign_keypair_sk', privateKeyBase64);
    setInputValueAndUpdate('sign_sign_sk', privateKeyBase64);
}
window.sign_keypair = sign_keypair;

async function sign_sign(signName) {
    const sign = await getSIGNImplementation(signName);
    const timingPlaceholder = document.getElementById('sign_sign_timing');
    timingPlaceholder.innerHTML = '0';

    const privateKey = _base64ToArrayBuffer(document.getElementById('sign_sign_sk').value);
    if (privateKey.byteLength !== await sign.privateKeyBytes) {
        console.error(`SIGN-Sign> Invalid private key length: got ${privateKey.byteLength} bytes, expected ${await sign.privateKeyBytes}`);
        return;
    }
    const msg = document.getElementById('sign_sign_msg').value;


    const startTime = new Date();
    const { signature } = await sign.sign(_utf8ToArrayBuffer(msg), privateKey);
    const elapsedTimeMs = new Date() - startTime;
    timingPlaceholder.innerHTML = `${elapsedTimeMs}`;

    const signatureBase64 = _arrayBufferToBase64(signature);
    setInputValueAndUpdate('sign_sign_sign', signatureBase64);
    setInputValueAndUpdate('sign_verify_sign', signatureBase64);

    setInputValueAndUpdate('sign_verify_msg', msg);
}
window.sign_sign = sign_sign;

async function sign_verify(signName) {
    const sign = await getSIGNImplementation(signName);
    const timingPlaceholder = document.getElementById('sign_verify_timing');
    timingPlaceholder.innerHTML = '0';

    const signatureInput = document.getElementById('sign_verify_sign');
    signatureInput.style.color = '';

    const publicKey = _base64ToArrayBuffer(document.getElementById('sign_verify_pk').value);
    if (publicKey.byteLength !== await sign.publicKeyBytes) {
        console.error(`SIGN-Verify> Invalid public key length: got ${publicKey.byteLength} bytes, expected ${await sign.publicKeyBytes}`);
        return;
    }
    const msg = document.getElementById('sign_verify_msg').value;
    const signature = _base64ToArrayBuffer(signatureInput.value);
    if (signature.byteLength > await sign.signatureBytes) {
        console.error(`SIGN-Verify> Invalid signature length: got ${signature.byteLength} bytes, expected at most ${await sign.signatureBytes}`);
        return;
    }

    const startTime = new Date();
    const verified = await sign.verify(signature, _utf8ToArrayBuffer(msg), publicKey);
    const elapsedTimeMs = new Date() - startTime;
    timingPlaceholder.innerHTML = `${elapsedTimeMs}`;

    signatureInput.style.color = verified ? '#198754' : '#dc3545';
}
window.sign_verify = sign_verify;

async function sign_run_all(signName) {
    const msg = 'The message I want to sign.';

    await sign_keypair(signName);
    const msgInput = document.getElementById('sign_sign_msg');
    if (!msgInput.value) {
        msgInput.value = msg;
    }
    await sign_sign(signName);
    await sign_verify(signName);
}
window.sign_run_all = sign_run_all;

function addBytesCounter(watchedInputId, counterOutput, expectedByteLength, acceptLessOrEqual = false) {
    document.getElementById(watchedInputId).addEventListener('input', e => {
        let byteLength = 0;
        try {
            byteLength = _base64ToArrayBuffer(e.target.value).byteLength;
        } catch {}
        const counterElement = document.getElementById(counterOutput);
        counterElement.innerHTML = byteLength + ' bytes';
        if (e.target.value.length !== 0 && byteLength !== expectedByteLength && (!acceptLessOrEqual || byteLength > expectedByteLength)) {
            counterElement.style.color = '#dc3545';
        } else {
            counterElement.style.color = '';
        }
    });
}

function checkInputEquality(watchedInputId1, watchedInputId2) {
    const listener = _ => {
        const watchedInput1 = document.getElementById(watchedInputId1);
        const watchedInput2 = document.getElementById(watchedInputId2);
        if (!watchedInput1.value || !watchedInput2.value) {
            watchedInput1.style.color = watchedInput2.style.color = '';
        } else if (watchedInput1.value === watchedInput2.value) {
            watchedInput1.style.color = watchedInput2.style.color = '#198754';
        } else {
            watchedInput1.style.color = watchedInput2.style.color = '#dc3545';
        }
    };
    document.getElementById(watchedInputId1).addEventListener('input', listener);
    document.getElementById(watchedInputId2).addEventListener('input', listener);
}

function setInputValueAndUpdate(id, value) {
    const input = document.getElementById(id);
    input.value = value;
    input.dispatchEvent(new Event('input'));
}

function clickOnSubmenuLink(thisSelector) {
    $('#navbarNavDarkDropdown').collapse('hide');
    const submenu = thisSelector.parent().parent();
    submenu.css('display', 'none');
    setTimeout(function() {
        submenu.css('display', '');
    });
}
window.clickOnSubmenuLink = clickOnSubmenuLink;

function displayFileSize(filePath, placeholderId) {
    fetch(filePath, { method: 'HEAD' }).then((result) => {
        document.getElementById(placeholderId).innerHTML = `${Math.floor(Number(result.headers.get('Content-Length')) / 1000)} kB`;
    });
}

function deactivateWASMChange() {
    console.log('Forget all loaded implementations');
    kemImplementations = {};
    signImplementations = {};
}
window.deactivateWASMChange = deactivateWASMChange;

function _base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

function _utf8ToArrayBuffer(string) {
    const bytes = new Uint8Array(string.length);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = string.charCodeAt(i);
    }
    return bytes;
}

// Split the byte array in chunks in order to support large public key such as McEliece Classic ones
function _arrayBufferToBase64(buffer) {
    const CHUNK_SZ = 0x8000;
    let c = [];
    for (let i=0; i < buffer.length; i+=CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, buffer.subarray(i, i+CHUNK_SZ)));
    }
    return window.btoa(c.join(''));
}
