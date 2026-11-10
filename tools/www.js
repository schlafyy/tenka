// Copies the game's files into www/, the folder the iOS app is built from (the repo root also holds tools, tests and the iOS project).
// Run: npm run www
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'www');
const FILES = ['index.html', 'ui.js', 'game.js', 'street.js', 'manifest.webmanifest', 'icon.png', 'icon-180.png', 'icon-512.png', 'data', 'fonts', 'crests', 'portraits', 'art'];
fs.rmSync(OUT, { recursive: true, force: true });
for (const f of FILES) fs.cpSync(path.join(ROOT, f), path.join(OUT, f), { recursive: true });
console.log('www:', FILES.length, 'entries');
