const fs = require('fs');
const path = require('path');

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'admin') continue;
      walk(p, acc);
    } else if (/\.(js|jsx)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const files = walk('app').concat(walk('components')).concat(walk('constants'));
let bad = 0;

for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const lines = t.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (/^\s*(backgroundColor|color|borderColor|shadowColor|tintColor)\s*:\s*rgba\(/.test(L)) {
      console.log('UNQUOTED', f + ':' + (i + 1), L.trim());
      bad++;
    }
    if (/backgroundColor:\s*''|color:\s*''/.test(L)) {
      console.log('EMPTYQ', f + ':' + (i + 1), L.trim());
      bad++;
    }
    // mismatched quotes like 'rgba(...)"
    if (/:\s*'rgba\([^']*$/.test(L) || /:\s*"rgba\([^"]*$/.test(L)) {
      console.log('OPENSTR', f + ':' + (i + 1), L.trim());
      bad++;
    }
  }
  // brace balance rough check
  const open = (t.match(/\{/g) || []).length;
  const close = (t.match(/\}/g) || []).length;
  if (open !== close) {
    console.log('BRACE', f, open, close);
    bad++;
  }
}

console.log('done bad=' + bad);
