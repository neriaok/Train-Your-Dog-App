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

run('vercel deploy --prod --yes --project train-your-dog-app --cwd ./dist');
