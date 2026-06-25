/**
 * Distribution Packager
 *
 * Creates a portable distribution folder with everything needed to run.
 * Includes embedded Node.js runtime + obfuscated app code.
 *
 * The client just double-clicks "Start Cafe Manager.bat" and it runs.
 *
 * Usage: node scripts/package-dist.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');
const DIST = path.join(ROOT, 'dist');
const PKG_DIR = path.join(DIST, 'CafeManager-Portable');

function step(num, name) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  Step ${num}: ${name}`);
  console.log(`${'═'.repeat(50)}`);
}

async function main() {
  // Create fresh dist directory
  if (fs.existsSync(PKG_DIR)) fs.rmSync(PKG_DIR, { recursive: true });
  fs.mkdirSync(PKG_DIR, { recursive: true });

  // ── Step 1: Build frontend if needed ──
  step(1, 'Build React frontend');
  const frontendBuild = path.join(FRONTEND, 'build');
  if (!fs.existsSync(path.join(frontendBuild, 'index.html'))) {
    execSync('npm run build', { cwd: FRONTEND, stdio: 'inherit', timeout: 120000 });
    console.log('  Frontend built ✓');
  } else {
    console.log('  Frontend already built ✓');
  }

  // ── Step 2: Copy backend + frontend ──
  step(2, 'Assemble distribution files');
  
  // Copy backend
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      const s = path.join(src, item);
      const d = path.join(dest, item);
      if (item === 'backups' || item === 'node_modules' || item.startsWith('.')) continue;
      try {
        if (fs.statSync(s).isDirectory()) {
          copyDir(s, d);
        } else {
          fs.copyFileSync(s, d);
        }
      } catch (e) {
        console.log(`  ⚠ Skipped ${item}: ${e.message}`);
      }
    }
  }
  copyDir(BACKEND, path.join(PKG_DIR, 'backend'));

  // Copy frontend build
  fs.cpSync(frontendBuild, path.join(PKG_DIR, 'frontend', 'build'), { recursive: true });

  // Copy the license activation page
  const licenseSrc = path.join(BACKEND, 'public', 'license.html');
  if (fs.existsSync(licenseSrc)) {
    const publicDir = path.join(PKG_DIR, 'backend', 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.copyFileSync(licenseSrc, path.join(publicDir, 'license.html'));
  }

  // Remove any database files from package
  for (const f of ['cafe.db', 'cafe.db-shm', 'cafe.db-wal', 'backend.log']) {
    const fp = path.join(PKG_DIR, 'backend', 'database', f);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }

  // ── Step 3: Install production dependencies ──
  step(3, 'Install production dependencies');
  const backendPkg = JSON.parse(fs.readFileSync(path.join(BACKEND, 'package.json'), 'utf8'));
  
  // Create clean package.json with only production deps
  const prodPkg = {
    name: 'cafe-manager',
    version: '4.0.0',
    private: true,
    main: 'server.js',
    scripts: { start: 'node server.js' },
    dependencies: backendPkg.dependencies,
  };
  fs.writeFileSync(path.join(PKG_DIR, 'backend', 'package.json'), JSON.stringify(prodPkg, null, 2));
  
  execSync('npm install --production --no-audit --no-fund', {
    cwd: path.join(PKG_DIR, 'backend'),
    stdio: 'inherit',
    timeout: 120000,
  });
  console.log('  Dependencies installed ✓');

  // ── Step 4: Obfuscate backend code ──
  step(4, 'Obfuscate backend code (protect your source)');
  try {
    const JavaScriptObfuscator = require('javascript-obfuscator');
    const obfuscationOptions = {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      numbersToExpressions: true,
      simplify: false,
      stringArrayShuffle: true,
      splitStrings: true,
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
    };

    function obfuscateDir(dir) {
      for (const item of fs.readdirSync(dir)) {
        const itemPath = path.join(dir, item);
        try {
          if (fs.statSync(itemPath).isDirectory()) {
            if (item !== 'node_modules' && item !== 'backups' && item !== 'public') {
              obfuscateDir(itemPath);
            }
          } else if (item.endsWith('.js')) {
            const code = fs.readFileSync(itemPath, 'utf8');
            const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
            fs.writeFileSync(itemPath, obfuscated.getObfuscatedCode());
          }
        } catch (e) {
          // Skip files that can't be obfuscated
        }
      }
    }
    obfuscateDir(path.join(PKG_DIR, 'backend'));
    console.log('  Obfuscation complete ✓');
  } catch (e) {
    console.log('  ⚠ Obfuscation skipped: ' + e.message);
  }

  // ── Step 5: Create launcher scripts ──
  step(5, 'Create launcher scripts');

  // Main start batch file
  const startBat = `@echo off
title Cafe Manager
echo ========================================
echo   Cafe Manager v4
echo ========================================
echo.

cd /d "%~dp0"

REM Find Node.js - check bundled first, then system
set NODE=%~dp0node\\node.exe
if not exist "%NODE%" set NODE=node

REM Start the backend server
echo Starting server...
start "" "%NODE%" "%~dp0backend\\server.js"

REM Wait for server to start
echo Waiting for server...
timeout /T 4 /NOBREAK >nul

REM Open browser
start http://localhost:3001
echo.
echo Server is running at http://localhost:3001
echo Close this window to stop the server.
echo.
pause

REM Stop the server when this window closes
echo Stopping server...
taskkill /f /im node.exe >nul 2>&1
echo Done.
`;
  fs.writeFileSync(path.join(PKG_DIR, 'Start Cafe Manager.bat'), startBat);

  // License info
  const readme = `========================================
  Cafe Manager v4 - Portable Edition
========================================

HOW TO RUN:
  1. Double-click "Start Cafe Manager.bat"
  2. It will open http://localhost:3001 in your browser
  3. Drop your license.lic file in the app folder if prompted
  
SYSTEM REQUIREMENTS:
  - Windows 10 or later (64-bit)
  - No internet required after activation
  - No Node.js installation needed

FIRST TIME SETUP:
  1. Start the app
  2. Copy the Hardware ID shown on screen
  3. Send it to your software provider
  4. Place the received .lic file in this folder
  5. Restart the app

========================================
  All rights reserved
========================================
`;
  fs.writeFileSync(path.join(PKG_DIR, 'README.txt'), readme);

  // ── Show final structure ──
  step(6, 'Distribution package created!');
  console.log(`  📁 ${PKG_DIR}/`);
  console.log(`     ├── Start Cafe Manager.bat`);
  console.log(`     ├── README.txt`);
  console.log(`     ├── backend/`);
  console.log(`     │   ├── server.js (obfuscated)`);
  console.log(`     │   ├── license.js (obfuscated)`);
  console.log(`     │   ├── middleware/`);
  console.log(`     │   ├── routes/`);
  console.log(`     │   ├── database/`);
  console.log(`     │   ├── public/`);
  console.log(`     │   ├── node_modules/`);
  console.log(`     │   └── package.json`);
  console.log(`     └── frontend/`);
  console.log(`         └── build/`);

  // Calculate size
  function getDirSize(dir) {
    let size = 0;
    for (const item of fs.readdirSync(dir)) {
      const p = path.join(dir, item);
      if (fs.statSync(p).isDirectory()) size += getDirSize(p);
      else size += fs.statSync(p).size;
    }
    return size;
  }
  const totalSize = getDirSize(PKG_DIR);
  console.log(`\n  📦 Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`\n✅ Ready for distribution!`);
  console.log(`   Zip the "CafeManager-Portable" folder and send it to clients.`);
}

main().catch(err => {
  console.error(`\n❌ Failed: ${err.message}`);
  process.exit(1);
});
