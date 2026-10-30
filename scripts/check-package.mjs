// Verifies the packed library: no runtime dependencies, no tslib imports, expected files present.
// Usage: node scripts/check-package.mjs [distDir]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { forbiddenImportsInDir } from './bundle-imports.mjs';

const dist = process.argv[2] ?? 'dist/ng-mask';
const errors = [];
const manifest = JSON.parse(readFileSync(join(dist, 'package.json'), 'utf8'));

for (const field of ['dependencies', 'optionalDependencies', 'bundleDependencies']) {
  if (manifest[field] && Object.keys(manifest[field]).length > 0) {
    errors.push(`package.json must not declare ${field}: ${JSON.stringify(manifest[field])}`);
  }
}

const allowedPeers = new Set(['@angular/core', '@angular/forms']);
for (const peer of Object.keys(manifest.peerDependencies ?? {})) {
  if (!allowedPeers.has(peer)) {
    errors.push(`unexpected peer dependency: ${peer}`);
  }
}

errors.push(...forbiddenImportsInDir(join(dist, 'fesm2022'), [...allowedPeers]));

// `npm pack --json` returns an array in older npm releases and an object keyed by name in newer ones.
const packed = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: dist, encoding: 'utf8' }),
);
const [report] = Array.isArray(packed) ? packed : Object.values(packed);
const files = new Set(report.files.map((file) => file.path));
for (const required of ['package.json', 'README.md', 'LICENSE.md', 'CHANGELOG.md']) {
  if (!files.has(required)) {
    errors.push(`packed tarball is missing ${required}`);
  }
}

if (errors.length > 0) {
  console.error(`Package check failed for ${manifest.name}@${manifest.version}:`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(
  `Package check passed for ${manifest.name}@${manifest.version}: ` +
    `${files.size} files, no runtime dependencies, imports limited to ${[...allowedPeers].join(', ')}.`,
);
