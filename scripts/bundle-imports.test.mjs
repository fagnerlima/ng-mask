import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { forbiddenImports, forbiddenImportsInDir, importSpecifiers } from './bundle-imports.mjs';

const FIXTURES = new URL('./fixtures/bundles/', import.meta.url);
const PEERS = ['@angular/core', '@angular/forms'];
const fixture = (name) => readFileSync(new URL(name, FIXTURES), 'utf8');
const check = (name) => forbiddenImports(fixture(name), name, PEERS);

test('accepts a bundle that only imports peers and relative chunks', () => {
  assert.deepEqual(check('clean.mjs'), []);
});

test('reports static imports', () => {
  assert.deepEqual(importSpecifiers(fixture('static-tslib.mjs')).specifiers, ['tslib']);
  assert.match(check('static-tslib.mjs').join(), /imports "tslib"/);
});

test('reports side-effect imports', () => {
  assert.deepEqual(check('side-effect.mjs'), [
    'side-effect.mjs imports "zone.js", which is not an allowed peer dependency',
  ]);
});

test('reports re-exports', () => {
  assert.deepEqual(check('reexport.mjs'), [
    'reexport.mjs imports "third-party-mask", which is not an allowed peer dependency',
  ]);
});

test('reports dynamic imports', () => {
  assert.deepEqual(check('dynamic.mjs'), [
    'dynamic.mjs imports "jquery", which is not an allowed peer dependency',
  ]);
});

test('reports dynamic imports with a computed specifier', () => {
  assert.deepEqual(check('computed-dynamic.mjs'), [
    'computed-dynamic.mjs has 1 dynamic import(s) with a computed specifier',
  ]);
});

test('reads minified bundles', () => {
  assert.deepEqual(importSpecifiers(fixture('minified.mjs')).specifiers.sort(), [
    '@angular/core',
    'left-pad',
    'lodash',
  ]);
  assert.equal(check('minified.mjs').length, 2);
});

test('checks every bundle of a directory', () => {
  const errors = forbiddenImportsInDir(fileURLToPath(FIXTURES), PEERS);

  assert.equal(errors.filter((error) => error.startsWith('clean.mjs')).length, 0);
  for (const name of ['static-tslib', 'side-effect', 'reexport', 'dynamic', 'computed-dynamic']) {
    assert.ok(
      errors.some((error) => error.startsWith(`${name}.mjs`)),
      name,
    );
  }
});
