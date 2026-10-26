const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

const missing = [];
for (const dep of Object.keys(allDeps)) {
  const depPkgPath = path.join('node_modules', dep, 'package.json');
  if (!fs.existsSync(depPkgPath)) {
    missing.push(dep);
  }
}

console.log('Missing packages in node_modules:', missing);
