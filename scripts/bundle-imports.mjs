// Finds the modules a built bundle loads, to prove the package needs nothing but its peers.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LITERAL_SPECIFIERS = [
  /\bfrom\s*["'`]([^"'`]+)["'`]/g, // import x from 'a'; export { x } from 'a'
  /\bimport\s*["'`]([^"'`]+)["'`]/g, // import 'a' (side effect)
  /\bimport\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g, // import('a')
  /\brequire\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g, // require('a')
];
const COMPUTED_DYNAMIC_IMPORT = /\bimport\s*\(\s*(?!["'`][^"'`]+["'`]\s*\))/g;

/** Lists module specifiers loaded by `source`, and counts imports whose target is computed. */
export function importSpecifiers(source) {
  const specifiers = new Set();

  for (const pattern of LITERAL_SPECIFIERS) {
    for (const match of source.matchAll(pattern)) {
      specifiers.add(match[1]);
    }
  }

  return {
    specifiers: [...specifiers],
    computedImports: [...source.matchAll(COMPUTED_DYNAMIC_IMPORT)].length,
  };
}

/** Describes every import of `source` that is not in `allowed` (relative paths are fine). */
export function forbiddenImports(source, file, allowed) {
  const { specifiers, computedImports } = importSpecifiers(source);
  const errors = specifiers
    .filter((specifier) => !specifier.startsWith('.') && !allowed.includes(specifier))
    .map((specifier) => `${file} imports "${specifier}", which is not an allowed peer dependency`);

  if (computedImports > 0) {
    errors.push(`${file} has ${computedImports} dynamic import(s) with a computed specifier`);
  }

  return errors;
}

/** Checks every `.mjs` bundle in `dir`. */
export function forbiddenImportsInDir(dir, allowed) {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.mjs'))
    .flatMap((file) => forbiddenImports(readFileSync(join(dir, file), 'utf8'), file, allowed));
}
