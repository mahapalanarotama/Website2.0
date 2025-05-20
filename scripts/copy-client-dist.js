// scripts/copy-client-dist.js
// Cross-platform script to copy client/dist to server/public
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../client/dist');
const dest = path.join(__dirname, '../server/public');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursiveSync(src, dest);
