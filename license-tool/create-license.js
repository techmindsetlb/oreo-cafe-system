/**
 * License File Creator
 * 
 * Creates signed .lic license files for your clients.
 * 
 * Usage: node create-license.js
 * 
 * You'll be prompted for:
 *   - Hardware ID (from the client's machine)
 *   - Client name (e.g. "Joe's Cafe")
 *   - Expiry date (e.g. "2026-12-31" or "30" for 30 days from now)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     Cafe Manager - License Creator       ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // Load private key
  const privateKeyPath = path.join(__dirname, 'private.pem');
  if (!fs.existsSync(privateKeyPath)) {
    console.error('❌ private.pem not found!');
    console.log('   Run "node generate-keys.js" first to create your key pair.\n');
    process.exit(1);
  }
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  const hardwareId = await ask('Enter hardware ID from client: ');
  if (!hardwareId.trim()) {
    console.error('❌ Hardware ID is required.');
    process.exit(1);
  }

  const clientName = await ask('Enter client name (e.g. "Joe\'s Cafe"): ');
  if (!clientName.trim()) {
    console.error('❌ Client name is required.');
    process.exit(1);
  }

  const expiryInput = await ask('Expiry (date like "2026-12-31" or days like "30"): ');
  let expiresAt;
  if (/^\d+$/.test(expiryInput.trim())) {
    // Days from now
    const d = new Date();
    d.setDate(d.getDate() + parseInt(expiryInput.trim()));
    expiresAt = d.toISOString().split('T')[0];
  } else {
    expiresAt = expiryInput.trim();
  }

  if (!expiresAt || isNaN(new Date(expiresAt).getTime())) {
    console.error('❌ Invalid expiry date.');
    process.exit(1);
  }

  // Build the license payload
  const license = {
    hardware_id: hardwareId.trim(),
    client_name: clientName.trim(),
    issued_at: new Date().toISOString().split('T')[0],
    expires_at: expiresAt,
    version: 1,
  };

  // Sign the license
  const signer = crypto.createSign('sha256');
  signer.update(JSON.stringify(license));
  signer.end();
  const signature = signer.sign(privateKey, 'base64');

  // Create the .lic file (JSON with signature)
  const licenseFile = {
    ...license,
    signature,
  };

  const filename = `${clientName.trim().replace(/[^a-zA-Z0-9]/g, '_')}.lic`;
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(licenseFile, null, 2));

  console.log(`\n✅ License created: ${filename}`);
  console.log(`   Client:     ${clientName.trim()}`);
  console.log(`   Hardware:   ${hardwareId.trim()}`);
  console.log(`   Expires:    ${expiresAt}`);
  console.log(`   File:       ${filePath}\n`);
  console.log('📤 Send this .lic file to your client.');
  console.log('   They just drop it in the app folder.\n');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
