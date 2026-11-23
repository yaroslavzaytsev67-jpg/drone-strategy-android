const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..', 'www');
for (const name of ['index.html', 'style.css', 'game.js']) {
  if (!fs.existsSync(path.join(out, name))) throw new Error('Missing ' + name);
}
const vendor = path.join(out, 'vendor');
fs.mkdirSync(vendor, { recursive: true });
const phaser = path.join(__dirname, '..', 'node_modules', 'phaser', 'dist', 'phaser.min.js');
if (!fs.existsSync(phaser)) throw new Error('Phaser dependency is not installed');
fs.copyFileSync(phaser, path.join(vendor, 'phaser.min.js'));
console.log('Web game assets ready:', out);