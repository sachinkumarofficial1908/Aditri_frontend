const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');

if (!fs.existsSync(publicDir)) {
  process.exit(0);
}

fs.mkdirSync(distDir, { recursive: true });

for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
  const source = path.join(publicDir, entry.name);
  const target = path.join(distDir, entry.name);
  fs.cpSync(source, target, { recursive: true });
}
