/**
 * Convert Selling-Guide.html to PDF using Chrome headless
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'Selling-Guide.html');
const PDF = path.join(ROOT, 'Selling-Guide.pdf');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(HTML)) {
  console.error('❌ Selling-Guide.html not found at:', HTML);
  process.exit(1);
}

const fileUrl = 'file:///' + HTML.replace(/\\/g, '/');

try {
  execSync(
    `"${CHROME}" --headless --disable-gpu --no-sandbox --print-to-pdf="${PDF}" --no-margins --page-size=A4 "${fileUrl}"`,
    { stdio: 'pipe', timeout: 30000, shell: true }
  );
  if (fs.existsSync(PDF)) {
    const size = (fs.statSync(PDF).size / 1024).toFixed(0);
    console.log(`✅ PDF created: ${PDF}`);
    console.log(`   Size: ${size} KB`);
  } else {
    console.error('❌ PDF was not created');
    process.exit(1);
  }
} catch (e) {
  console.error('❌ Failed:', e.stderr ? e.stderr.toString() : e.message);
  process.exit(1);
}
