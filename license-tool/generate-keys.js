/**
 * License Key Generator
 * 
 * Generates an RSA-4096 key pair for signing license files.
 * Run this ONCE on YOUR computer to create private.pem and public.pem.
 * 
 * Usage: node generate-keys.js
 * 
 * - private.pem → KEEP SECRET (sign licenses on your PC)
 * - public.pem  → embed in the app (verify licenses on client's PC)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const outDir = __dirname;

fs.writeFileSync(path.join(outDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(outDir, 'public.pem'), publicKey);

console.log('✅ RSA key pair generated!');
console.log('   private.pem → KEEP SECRET (use to sign licenses)');
console.log('   public.pem  → EMBED IN APP (use to verify licenses)');
console.log('');
console.log('⚠  Store private.pem somewhere safe and NEVER distribute it!');
