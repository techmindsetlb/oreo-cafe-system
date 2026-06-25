/**
 * Build Script — Node.js Single Executable Application (SEA)
 *
 * Uses Node.js 20+ built-in SEA feature.
 * No external tools needed - works with Node.js installed on this machine.
 *
 * Usage: node scripts/build-sea.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');
const DIST = path.join(ROOT, 'dist');
const BUILD = path.join(DIST, 'sea-build');

function run(cmd, cwd = ROOT) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', timeout: 120000 });
}

function step(num, name) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  Step ${num}: ${name}`);
  console.log(`${'═'.repeat(50)}`);
}

async function main() {
  // Ensure directories
  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);
  if (fs.existsSync(BUILD)) fs.rmSync(BUILD, { recursive: true });
  fs.mkdirSync(BUILD, { recursive: true });

  // ── Step 1: Build frontend ──
  step(1, 'Build React frontend');
  if (fs.existsSync(path.join(FRONTEND, 'build', 'index.html'))) {
    console.log('  Frontend already built ✓');
  } else {
    run('npm run build', FRONTEND);
  }

  // ── Step 2: Copy backend + frontend build to build directory ──
  step(2, 'Assemble app files');

  // Copy all backend files
  function copyAll(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      const s = path.join(src, item);
      const d = path.join(dest, item);
      if (item === 'backups' || item.startsWith('.')) continue;
      try {
        if (fs.statSync(s).isDirectory()) {
          copyAll(s, d);
        } else {
          fs.copyFileSync(s, d);
        }
      } catch (e) {
        console.log(`  ⚠ Skipped ${item}: ${e.message}`);
      }
    }
  }
  copyAll(BACKEND, BUILD);

  // Copy frontend build
  const publicBuild = path.join(BUILD, 'public', 'build');
  if (!fs.existsSync(path.join(BUILD, 'public'))) fs.mkdirSync(path.join(BUILD, 'public'), { recursive: true });
  fs.cpSync(path.join(FRONTEND, 'build'), publicBuild, { recursive: true });

  // Ensure license.html
  const licSrc = path.join(BACKEND, 'public', 'license.html');
  if (fs.existsSync(licSrc)) fs.copyFileSync(licSrc, path.join(BUILD, 'public', 'license.html'));

  // Remove any database files
  for (const f of ['cafe.db', 'cafe.db-shm', 'cafe.db-wal', 'backend.log']) {
    const fp = path.join(BUILD, 'database', f);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }

  // ── Step 3: Bundle into single JS file using Node's bundler ──
  step(3, 'Bundle app into single JS file');

  // Create a bundle entry point that includes all dependencies
  const bundleContent = `
    // Cafe Manager SEA Bundle
    // Set the correct paths for the bundled app
    process.env.SEA = 'true';
    process.env.SEA_DIR = require('path').dirname(process.execPath);
    
    // Start the server
    require('./server.js');
  `;
  fs.writeFileSync(path.join(BUILD, 'sea-entry.js'), bundleContent);

  // ── Step 4: Create the SEA config and blob ──
  step(4, 'Create SEA blob');

  const seaConfig = {
    main: path.join(BUILD, 'sea-entry.js'),
    output: path.join(BUILD, 'sea-prep.blob'),
    disableExperimentalSEAWarning: true,
  };
  fs.writeFileSync(path.join(BUILD, 'sea-config.json'), JSON.stringify(seaConfig));

  // Generate the blob
  execSync(`node --experimental-sea-config sea-config.json`, {
    cwd: BUILD,
    stdio: 'inherit',
    timeout: 60000,
  });

  // ── Step 5: Create the executable ──
  step(5, 'Create executable');

  const outPath = path.join(DIST, 'CafeManager.exe');
  const nodePath = process.execPath; // Path to the current Node.js executable

  // Copy node.exe as the base
  fs.copyFileSync(nodePath, outPath);

  // Remove any existing signature (Windows code signing)
  try {
    execSync(`signtool remove /s "${outPath}"`, { stdio: 'pipe', timeout: 10000 });
  } catch { /* not signed, fine */ }

  // Inject the SEA blob (Windows)
  execSync(
    `npx postject "${outPath}" NODE_SEA_BLOB "${path.join(BUILD, 'sea-prep.blob')}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df25b192`,
    { cwd: BUILD, stdio: 'inherit', timeout: 60000 }
  );

  // ── Done ──
  const stats = fs.statSync(outPath);
  console.log(`\n✅ Build complete!`);
  console.log(`   Output: ${outPath}`);
  console.log(`   Size:   ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Created: ${new Date().toLocaleString()}`);

  // Cleanup
  console.log(`\n🧹 Cleaning up...`);
  fs.rmSync(BUILD, { recursive: true });
  console.log(`✅ Done!`);
}

main().catch(err => {
  console.error(`\n❌ Build failed: ${err.message}`);
  process.exit(1);
});
