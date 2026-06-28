// Bump lesson-nav.js cache-buster across all HTML files.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const version = '12';
const patterns = [
  /lesson-nav\.js(\?v=\d+)?/g,
  `lesson-nav.js?v=${version}`,
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      walk(p, files);
    } else if (name.endsWith('.html')) {
      files.push(p);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('lesson-nav.js')) continue;
  const next = text.replace(patterns[0], patterns[1]);
  if (next !== text) {
    fs.writeFileSync(file, next);
    changed++;
    console.log('updated', path.relative(root, file));
  }
}
console.log(`Done — ${changed} file(s) updated to ?v=${version}`);