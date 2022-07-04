all: primitives all_kem all_sign

primitives:
	cd src && $(MAKE) primitives_tests && cd .. && \
	npm run build && \
	npm run test:primitives

KEM := firesaber frodokem1344aes frodokem1344shake frodokem640aes frodokem640shake frodokem976aes frodokem976shake hqc-rmrs-128 hqc-rmrs-192 hqc-rmrs-256 kyber1024 kyber1024-90s kyber512 kyber512-90s kyber768 kyber768-90s lightsaber mceliece348864 mceliece348864f mceliece460896 mceliece460896f mceliece6688128 mceliece6688128f mceliece6960119 mceliece6960119f mceliece8192128 mceliece8192128f ntruhps2048509 ntruhps2048677 ntruhps40961229 ntruhps4096821 ntruhrss1373 ntruhrss701 ntrulpr1013 ntrulpr1277 ntrulpr653 ntrulpr761 ntrulpr857 ntrulpr953 saber sntrup1013 sntrup1277 sntrup653 sntrup761 sntrup857 sntrup953

define make-kem-target
kem-$1:
	cd src && $(MAKE) kem kem_name=$1 && cd ..
	npm run build
	npm run test:kem
	OUTPUT_FILE_NAME=pqc-kem-$1 npm run webpack:kem
	mkdir -p docs/bin/pqc-kem-$1/
	cp bundle/pqc-kem-$1.* docs/bin/pqc-kem-$1/
	rm -rf package/
	mkdir package
	mkdir -p package/dist
	cp package.json README.md package/
	sed -i "s/\"name\": \"pqc.js\",/\"name\": \"pqc-kem-$1-browser\",/" package/package.json
	sed -i "s/\"main\": \"dist\/kem.js\",/\"main\": \"dist\/pqc-kem-$1.js\",/" package/package.json
	cp bundle/pqc-kem-$1.* package/dist/
	cp dist/kem.d.ts package/dist/
	tar zcf docs/bin/pqc-kem-$1/pqc-kem-$1-browser.tgz package/
	rm package/dist/pqc-kem-$1.*
	cp dist/kem.js dist/kem.asm.js dist/kem.wasm.js dist/kem.wasm.wasm package/dist/
	cp package.json package/
	sed -i "s/\"name\": \"pqc.js\",/\"name\": \"pqc-kem-$1-node\",/" package/package.json
	tar zcf docs/bin/pqc-kem-$1/pqc-kem-$1-node.tgz package/
	rm -r package/
endef

$(foreach element,$(KEM),$(eval $(call make-kem-target,$(element))))

all_kem: $(foreach element,$(KEM),kem-$(element))


SIGN := dilithium2 dilithium2aes dilithium3 dilithium3aes dilithium5 dilithium5aes falcon-1024 falcon-512 rainbowI-circumzenithal rainbowI-classic rainbowI-compressed rainbowIII-circumzenithal rainbowIII-classic rainbowIII-compressed rainbowV-circumzenithal rainbowV-classic rainbowV-compressed sphincs-haraka-128f-robust sphincs-haraka-128f-simple sphincs-haraka-128s-robust sphincs-haraka-128s-simple sphincs-haraka-192f-robust sphincs-haraka-192f-simple sphincs-haraka-192s-robust sphincs-haraka-192s-simple sphincs-haraka-256f-robust sphincs-haraka-256f-simple sphincs-haraka-256s-robust sphincs-haraka-256s-simple sphincs-sha256-128f-robust sphincs-sha256-128f-simple sphincs-sha256-128s-robust sphincs-sha256-128s-simple sphincs-sha256-192f-robust sphincs-sha256-192f-simple sphincs-sha256-192s-robust sphincs-sha256-192s-simple sphincs-sha256-256f-robust sphincs-sha256-256f-simple sphincs-sha256-256s-robust sphincs-sha256-256s-simple sphincs-shake256-128f-robust sphincs-shake256-128f-simple sphincs-shake256-128s-robust sphincs-shake256-128s-simple sphincs-shake256-192f-robust sphincs-shake256-192f-simple sphincs-shake256-192s-robust sphincs-shake256-192s-simple sphincs-shake256-256f-robust sphincs-shake256-256f-simple sphincs-shake256-256s-robust sphincs-shake256-256s-simple

define make-sign-target
sign-$1:
	cd src && $(MAKE) sign sign_name=$1 && cd ..
	npm run build
	npm run test:sign
	OUTPUT_FILE_NAME=pqc-sign-$1 npm run webpack:sign
	mkdir -p docs/bin/pqc-sign-$1/
	cp bundle/pqc-sign-$1.* docs/bin/pqc-sign-$1/
	rm -rf package/
	mkdir package
	mkdir -p package/dist
	cp package.json README.md package/
	sed -i "s/\"name\": \"pqc.js\",/\"name\": \"pqc-sign-$1-browser\",/" package/package.json
	sed -i "s/\"main\": \"dist\/kem.js\",/\"main\": \"dist\/pqc-sign-$1.js\",/" package/package.json
	sed -i "s/\"types\": \"dist\/kem.d.ts\",/\"types\": \"dist\/sign.d.ts\",/" package/package.json
	cp bundle/pqc-sign-$1.* package/dist/
	cp dist/sign.d.ts package/dist/
	tar zcf docs/bin/pqc-sign-$1/pqc-sign-$1-browser.tgz package/
	cp dist/sign.js package/dist/pqc-sign-$1.js
	rm package/dist/pqc-sign-$1.*
	cp dist/sign.js dist/sign.asm.js dist/sign.wasm.js dist/sign.wasm.wasm package/dist/
	cp package.json package/
	sed -i "s/\"name\": \"pqc.js\",/\"name\": \"pqc-sign-$1-node\",/" package/package.json
	sed -i "s/\"main\": \"dist\/kem.js\",/\"main\": \"dist\/sign.js\",/" package/package.json
	sed -i "s/\"types\": \"dist\/kem.d.ts\",/\"types\": \"dist\/sign.d.ts\",/" package/package.json
	tar zcf docs/bin/pqc-sign-$1/pqc-sign-$1-node.tgz package/
	rm -r package/
endef

$(foreach element,$(SIGN),$(eval $(call make-sign-target,$(element))))

all_sign: $(foreach element,$(SIGN),sign-$(element))

clean:
	rm -rf dist/ docs/bin/ bundle/pqcKEM.js bundle/pqcSIGN.js && \
	cd src/ && $(MAKE) clean && cd ..
