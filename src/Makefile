kem_name ?= kyber1024

kem_name_without_dashes = $(shell echo $(kem_name) | sed 's/-//g')
kem_name_uppercase = $(shell echo $(kem_name_without_dashes) | tr [:lower:] [:upper:])

kem: dependencies
	bash -c ' \
			args="$$(echo " \
				--memory-init-file 0 \
				--no-entry `# No main function` \
				-DKEM_NAME=$(kem_name) \
				-DKEM_NAME_UPPERCASE=$(kem_name_uppercase) \
				-DCONFIGURED=1 `# Hide libsodium warnings with direct calls` \
				-s DYNAMIC_EXECUTION=0 `# Avoid usage of eval for WASM` \
				-s MODULARIZE=1 `# Emscripten exports a module` \
				`# Module attributes modified, cf https://emscripten.org/docs/api_reference/module.html` \
				-s INCOMING_MODULE_JS_API=[\"locateFile\"] \
				-s EXPORT_NAME="createKEMNativeCaller" \
				-s EXPORT_ES6=1 \
				-s TOTAL_MEMORY=16777216 -s TOTAL_STACK=8388608 \
				-s ASSERTIONS=0 \
				-s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
				-s ALIASING_FUNCTION_POINTERS=1 \
				-s DISABLE_EXCEPTION_CATCHING=1 \
				-s FILESYSTEM=0 \
				-s INVOKE_RUN=false \
				-s ASYNCIFY `# Allow usage of async functions in JS included in C code` \
				-s ASYNCIFY_IGNORE_INDIRECT `# Async JS functions are not called through pointers` \
				-IPQClean/crypto_kem/$(kem_name) -IPQClean/common -I. \
				-Ilibsodium/src/libsodium/include/sodium \
				$$(ls PQClean/common/*.c) \
				libsodium/src/libsodium/randombytes/randombytes.c \
				$$(ls PQClean/crypto_kem/$(kem_name)/clean/*.c) \
				sha2.c \
				aes.c \
				kem.c \
				-s EXPORTED_RUNTIME_METHODS=\"[ \
					ccall, \
					writeArrayToMemory \
				]\" \
				-s EXPORTED_FUNCTIONS=\"[ \
					_free, \
					_malloc, \
					_kem_init, \
					_kem_keypair, \
					_kem_encapsulate, \
					_kem_decapsulate, \
					_kem_public_key_bytes, \
					_kem_private_key_bytes, \
					_kem_ciphertext_bytes, \
					_kem_shared_secret_bytes \
				]\" \
			" | perl -pe "s/\s+/ /g")" && \
			\
			bash -c "emcc -Oz -s WASM=0 -s SINGLE_FILE=1 $$args -o kem.asm.js" && \
			bash -c "emcc -O3 -s WASM=1 $$args -o kem.wasm.js" && \
			sed -i "s/fs.readFileSync(filename/fs.readFileSync(new URL(filename)/g" kem.wasm.js \
	'

sign_name ?= dilithium5

sign_name_without_dashes = $(shell echo $(sign_name) | sed 's/-//g')
sign_name_uppercase = $(shell echo $(sign_name_without_dashes) | tr [:lower:] [:upper:])

# sphincs-sha256 implementations are calling sha256 via indirect calls (function pointers)
sphincs_option = $(shell bash -c "[[ $(sign_name) == sphincs-sha256* ]] || echo \"-s ASYNCIFY_IGNORE_INDIRECT\"")

sign: dependencies
	bash -c ' \
			args="$$(echo " \
				--memory-init-file 0 \
				--no-entry `# No main function` \
				-DSIGN_NAME=$(sign_name) \
				-DSIGN_NAME_UPPERCASE=$(sign_name_uppercase) \
				-DCONFIGURED=1 `# Hide libsodium warnings with direct calls` \
				-s DYNAMIC_EXECUTION=0 `# Avoid usage of eval for WASM` \
				-s MODULARIZE=1 `# Emscripten exports a module` \
				`# Module attributes modified, cf https://emscripten.org/docs/api_reference/module.html` \
				-s INCOMING_MODULE_JS_API=[\"locateFile\"] \
				-s EXPORT_NAME="createSIGNativeCaller" \
				-s EXPORT_ES6=1 \
				-s TOTAL_MEMORY=16777216 -s TOTAL_STACK=8388608 \
				-s ASSERTIONS=0 \
				-s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
				-s ALIASING_FUNCTION_POINTERS=1 \
				-s DISABLE_EXCEPTION_CATCHING=1 \
				-s FILESYSTEM=0 \
				-s INVOKE_RUN=false \
				-s ASYNCIFY `# Allow usage of async functions in JS included in C code` \
				$(sphincs_option) \
				-IPQClean/crypto_sign/$(sign_name) -IPQClean/common -I. \
				-Ilibsodium/src/libsodium/include/sodium \
				$$(ls PQClean/common/*.c) \
				libsodium/src/libsodium/randombytes/randombytes.c \
				$$(ls PQClean/crypto_sign/$(sign_name)/clean/*.c) \
				sha2.c \
				aes.c \
				sign.c \
				-s EXPORTED_RUNTIME_METHODS=\"[ \
					ccall, \
					writeArrayToMemory \
				]\" \
				-s EXPORTED_FUNCTIONS=\"[ \
					_free, \
					_malloc, \
					_sign_init, \
					_sign_keypair, \
					_sign_signature, \
					_sign_verify, \
					_sign_public_key_bytes, \
					_sign_private_key_bytes, \
					_sign_signature_bytes \
				]\" \
			" | perl -pe "s/\s+/ /g")" && \
			\
			bash -c "emcc -Oz -s WASM=0 -s SINGLE_FILE=1 $$args -o sign.asm.js" && \
			bash -c "emcc -O3 -s WASM=1 $$args -o sign.wasm.js" && \
			sed -i "s/fs.readFileSync(filename/fs.readFileSync(new URL(filename)/g" sign.wasm.js \
	'

primitives_tests: dependencies
	bash -c ' \
			args="$$(echo " \
				--memory-init-file 0 \
				--no-entry `# No main function` \
				-DCONFIGURED=1 `# Hide libsodium warnings with direct calls` \
				-s DYNAMIC_EXECUTION=0 `# Avoid usage of eval for WASM` \
				-s SINGLE_FILE=1`# Inline the WASM because there are no CSP` \
				-s MODULARIZE=1 `# Emscripten exports a module` \
				-s EXPORT_NAME="createPrimitivesTestsCaller" \
				-s EXPORT_ES6=1 \
				-s TOTAL_MEMORY=16777216 -s TOTAL_STACK=8388608 \
				-s ASSERTIONS=1 \
				-s AGGRESSIVE_VARIABLE_ELIMINATION=1 \
				-s ALIASING_FUNCTION_POINTERS=1 \
				-s DISABLE_EXCEPTION_CATCHING=0 \
				-s FILESYSTEM=0 \
				-s INVOKE_RUN=false \
				-s ASYNCIFY `# Allow usage of async functions in JS included in C code` \
				-s ASYNCIFY_IGNORE_INDIRECT `# Async JS functions are not called through pointers` \
				-IPQClean/common -I. \
				-Ilibsodium/src/libsodium/include/sodium \
				libsodium/src/libsodium/randombytes/randombytes.c \
				sha2.c \
				aes.c \
				primitives_tests.c \
				-s EXPORTED_RUNTIME_METHODS=\"[ \
					ccall \
				]\" \
				-s EXPORTED_FUNCTIONS=\"[ \
					_run_tests \
				]\" \
			" | perl -pe "s/\s+/ /g")" && \
			\
			bash -c "emcc -Oz -s WASM=0 $$args -o primitives_tests.asm.js" && \
			bash -c "emcc -O3 -s WASM=1 $$args -o primitives_tests.wasm.js" \
	'

dependencies:
	if [ ! -d "PQClean" ]; then \
  		git clone -q --depth 1 https://github.com/PQClean/PQClean && \
  		rm PQClean/common/randombytes.* && rm PQClean/common/aes.* && \
  		sed -ri "s/( sha[0-9]{3})\(/\1_deprecated(/g" PQClean/common/sha2.c; \
	fi
	# About the need to declare a new package in libsodium https://github.com/emscripten-core/emscripten/issues/13551
	if [ ! -d "libsodium" ]; then \
		git clone -q --depth 1 -b stable https://github.com/jedisct1/libsodium && \
		cd libsodium && echo '{ "type": "commonjs" }' > package.json && \
		emconfigure ./configure --enable-minimal --disable-shared; \
	fi

clean:
	rm -rf PQClean/ libsodium/
	cp sample/*.js .
