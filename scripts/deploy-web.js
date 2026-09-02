#!/usr/bin/env node
/**
 * Exports the web build and deploys it to Vercel production.
 *
 * `expo export` puts font assets under a path that literally contains a
 * "node_modules" segment (e.g. assets/node_modules/@expo-google-fonts/...).
 * Vercel's uploader silently drops any path containing that folder name,
 * which breaks font loading on every deploy unless those files are moved
 * somewhere else first. This script does that rename (and patches the
 * compiled bundle's references to match) before deploying, so `npm run
 * deploy:web` always produces a working deployment - no manual fixup step
 * to remember.
 *
 * `expo export` also wipes the dist/ output directory on every run, which
 * destroys dist/.vercel/project.json (the file that normally remembers
 * which Vercel project a directory deploys to). Without --project, that
 * would make every deploy create a brand new project instead of updating
 * the existing one - so the project name is passed explicitly below.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const oldAssetDir = path.join(dist, 'assets', 'node_modules');
const newAssetDir = path.join(dist, 'assets', 'vendor');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

function moveRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) moveRecursive(from, to);
    else fs.copyFileSync(from, to);
  }
  fs.rmSync(src, { recursive: true, force: true });
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

run('npx expo export --platform web');

if (fs.existsSync(oldAssetDir)) {
  moveRecursive(oldAssetDir, newAssetDir);
  const textFiles = walk(dist).filter(f => /\.(js|html|json)$/.test(f));
  let patched = 0;
  for (const file of textFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('assets/node_modules/')) {
      fs.writeFileSync(file, content.split('assets/node_modules/').join('assets/vendor/'));
      patched++;
    }
  }
  console.log(`Moved font assets out of a "node_modules" path and patched ${patched} file(s) referencing them.`);
}

// PWA support: manifest + service worker + icons, so the site is
// "installable" (Add to Home Screen) on mobile and desktop browsers.
// `expo export` regenerates dist/index.html from scratch every run with no
// way to configure these via app.json (Metro's web export doesn't support
// it the way the old webpack-based expo-cli did), so they're injected here
// instead of being hand-edited into a file that would just get wiped.
fs.copyFileSync(path.join(root, 'web', 'manifest.webmanifest'), path.join(dist, 'manifest.webmanifest'));
fs.copyFileSync(path.join(root, 'web', 'sw.js'), path.join(dist, 'sw.js'));
fs.copyFileSync(path.join(root, 'assets', 'icon.png'), path.join(dist, 'icon-192.png'));
fs.copyFileSync(path.join(root, 'assets', 'icon.png'), path.join(dist, 'icon-512.png'));

const indexPath = path.join(dist, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(
  '</head>',
  '  <link rel="manifest" href="/manifest.webmanifest">\n' +
  '  <meta name="theme-color" content="#FF6B35">\n' +
  '  <link rel="icon" href="/icon-192.png">\n' +
  '  <link rel="apple-touch-icon" href="/icon-192.png">\n' +
  '</head>'
);
html = html.replace(
  '</body>',
  '<script>if (\'serviceWorker\' in navigator) { window.addEventListener(\'load\', () => navigator.serviceWorker.register(\'/sw.js\')); }</script>\n</body>'
);
fs.writeFileSync(indexPath, html);
console.log('Injected PWA manifest, service worker, and icons into the export.');

run('vercel deploy --prod --yes --project train-your-dog-app --cwd ./dist');
