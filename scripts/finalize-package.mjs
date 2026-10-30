// Post-build step for dist/ng-mask:
// 1. copies the root docs (ng-packagr cannot read assets outside the project root);
// 2. removes the `tslib` dependency that ng-packagr always injects. The library targets ES2022
//    with `importHelpers: false`, so the bundles never import it; this script refuses to strip it
//    if they ever do.
import { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/ng-mask';
const DOCS = ['README.md', 'LICENSE.md', 'CHANGELOG.md'];

if (!existsSync(DIST)) {
  throw new Error(`${DIST} not found. Build the library first.`);
}

for (const file of DOCS) {
  copyFileSync(file, join(DIST, file));
}

const bundleDir = join(DIST, 'fesm2022');
const importsTslib = readdirSync(bundleDir)
  .filter((file) => file.endsWith('.mjs'))
  .some((file) => /from\s+['"]tslib['"]/.test(readFileSync(join(bundleDir, file), 'utf8')));

if (importsTslib) {
  throw new Error('The bundles import tslib; it cannot be removed from the dependencies.');
}

const manifestPath = join(DIST, 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
delete manifest.dependencies?.tslib;
if (manifest.dependencies && Object.keys(manifest.dependencies).length === 0) {
  delete manifest.dependencies;
}
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Finalized ${DIST}: copied ${DOCS.join(', ')} and removed the unused tslib dependency.`,
);
