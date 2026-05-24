// scripts/postbuild.js
const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../../public/react/.vite/manifest.json');
const indexPath = path.resolve(__dirname, '../../public/index.html');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const entry = Object.values(manifest).find(f => f.isEntry);
const jsFile = entry.file;
const cssFile = entry.css?.[0];

let html = fs.readFileSync(indexPath, 'utf-8');
html = html.replace(
  /<!-- VITE DIST BEGIN -->([\s\S]*?)<!-- VITE DIST END -->/g,
  `<!-- VITE DIST BEGIN -->
  <script type="module" crossorigin src="/react/${jsFile}"></script>
  ${cssFile ? `<link rel="stylesheet" crossorigin href="/react/${cssFile}">` : ''}
  <!-- VITE DIST END -->`
);
fs.writeFileSync(indexPath, html);
fs.unlinkSync(manifestPath);