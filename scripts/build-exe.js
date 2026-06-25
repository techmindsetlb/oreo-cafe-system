/**
 * Build Script
 *
 * 1. Builds the React frontend (if not already built)
 * 2. Obfuscates backend code
 * 3. Compiles into a single Windows .exe
 *
 * Usage: node scripts/build-exe.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');
const DIST = path.join(ROOT, 'dist');

function run(cmd, cwd = ROOT) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', timeout: 300000 });
}

function step(name) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${name}`);
  console.log(`${'═'.repeat(60)}`);
}

async function main() {
  // Ensure dist directory
  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

  // ── Step 1: Build frontend (skip if already built) ──
  const buildDir = path.join(FRONTEND, 'build');
  if (!fs.existsSync(buildDir) || !fs.existsSync(path.join(buildDir, 'index.html'))) {
    step('1/4: Building React frontend...');
    run('npm run build', FRONTEND);
  } else {
    step('1/4: React frontend already built ✓');
  }

  // ── Step 2: Create obfuscated build directory ──
  step('2/4: Setting up build directory...');
  const buildRoot = path.join(DIST, 'build-temp-' + Date.now());
  fs.mkdirSync(buildRoot, { recursive: true });

  // Copy all backend files (including node_modules for native modules)
  function copyDir(src, dest, skipPatterns = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      if (skipPatterns.includes(item) || item.startsWith('.')) continue;
      if (item === 'backups') continue;
      try {
        if (fs.statSync(srcPath).isDirectory()) {
          copyDir(srcPath, destPath, skipPatterns);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      } catch (e) {
        console.log(`  ⚠ Skipped: ${item} (${e.message})`);
      }
    }
  }

  // Copy backend directory (include node_modules for native modules like sqlite3)
  copyDir(BACKEND, buildRoot, []);
  // Copy frontend build into public/
  const publicBuild = path.join(buildRoot, 'public', 'build');
  if (!fs.existsSync(path.join(buildRoot, 'public'))) {
    fs.mkdirSync(path.join(buildRoot, 'public'), { recursive: true });
  }
  if (fs.existsSync(buildDir)) {
    if (fs.existsSync(publicBuild)) fs.rmSync(publicBuild, { recursive: true });
    fs.cpSync(buildDir, publicBuild, { recursive: true });
  }

  // Copy license.html
  const licenseSrc = path.join(BACKEND, 'public', 'license.html');
  const licenseDest = path.join(buildRoot, 'public', 'license.html');
  if (fs.existsSync(licenseSrc)) {
    fs.copyFileSync(licenseSrc, licenseDest);
  }

  // Remove any db files from the build (shouldn't bundle database)
  const dbPath = path.join(buildRoot, 'database', 'cafe.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');
  if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');

  // ── Step 3: Obfuscate backend JS files ──
  step('3/4: Obfuscating backend code...');
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
          if (item !== 'node_modules' && item !== 'backups') {
            obfuscateDir(itemPath);
          }
        } else if (item.endsWith('.js')) {
          const code = fs.readFileSync(itemPath, 'utf8');
          const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
          fs.writeFileSync(itemPath, obfuscated.getObfuscatedCode());
          console.log(`  ✓ ${path.relative(buildRoot, itemPath)}`);
        }
      } catch (err) {
        console.log(`  ⚠ ${path.relative(buildRoot, itemPath)} (${err.message})`);
      }
    }
  }
  obfuscateDir(buildRoot);

  // ── Step 4: Compile with pkg ──
  step('4/4: Compiling into .exe with pkg...');
  const outPath = path.join(DIST, 'CafeManager.exe');

  // Create the package.json for pkg
  const origPkg = JSON.parse(fs.readFileSync(path.join(BACKEND, 'package.json'), 'utf8'));
  const pkgJson = {
    name: 'cafe-manager',
    version: '4.0.0',
    description: 'Cafe Manager',
    bin: 'server.js',
    scripts: { start: 'node server.js' },
    dependencies: origPkg.dependencies,
  };
  fs.writeFileSync(path.join(buildRoot, 'package.json'), JSON.stringify(pkgJson, null, 2));

  // Run @yao-pkg/pkg from the build directory (maintained fork of pkg)
  execSync(
    `npx @yao-pkg/pkg . --targets node18-win-x64 --output "${outPath}"`,
    { cwd: buildRoot, stdio: 'inherit', timeout: 600000 }
  );

  const stats = fs.statSync(outPath);
  console.log(`\n✅ Build complete!`);
  console.log(`   Output: ${outPath}`);
  console.log(`   Size:   ${(stats.size / 1024 / 1024).toFixed(1)} MB`);

  // Cleanup
  console.log(`\n🧹 Cleaning up build directory...`);
  fs.rmSync(buildRoot, { recursive: true });
  console.log(`✅ Done!`);
}

main().catch(err => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});
