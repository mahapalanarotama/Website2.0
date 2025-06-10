// Script untuk generate assets-manifest.json dari folder public/assets (CommonJS)
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../client/public/assets');
const manifestPath = path.join(__dirname, '../client/public/assets-manifest.json');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      // Path relatif dari public
      results.push('/assets/' + path.relative(assetsDir, filePath).replace(/\\/g, '/'));
    }
  });
  return results;
}

const assets = walk(assetsDir);
fs.writeFileSync(manifestPath, JSON.stringify(assets, null, 2));
console.log('assets-manifest.json generated:', assets.length, 'files');
