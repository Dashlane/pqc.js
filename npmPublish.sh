#!/bin/bash

for kem in kyber512 kyber768 kyber1024 ntruhps2048509 ntruhps2048677 ntruhps4096821 lightsaber saber firesaber ntrulpr653 ntrulpr761 ntrulpr857
do
  npm publish --access public --registry https://registry.npmjs.org docs/bin/pqc-kem-$kem/pqc-kem-$kem-browser.tgz
  npm publish --access public --registry https://registry.npmjs.org docs/bin/pqc-kem-$kem/pqc-kem-$kem-node.tgz
done

for sign in dilithium2 dilithium3 dilithium5 falcon-512 falcon-1024
do
  npm publish --access public --registry https://registry.npmjs.org docs/bin/pqc-sign-$sign/pqc-sign-$sign-browser.tgz
  npm publish --access public --registry https://registry.npmjs.org docs/bin/pqc-sign-$sign/pqc-sign-$sign-node.tgz
done
