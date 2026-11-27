import assert from 'node:assert/strict';
import { test } from 'node:test';

import { changelogSection } from './changelog-section.mjs';

const changelog = `# Changelog

## [Unreleased]

### Added

- Something new.

## [3.0.0] - 2026-11-01

### Changed

- Rewrite.

## [2.2.1] - 2017-06-16

- Old entry.

[3.0.0]: https://github.com/fagnerlima/ng-mask/compare/v2.2.1...v3.0.0
[2.2.1]: https://github.com/fagnerlima/ng-mask/releases/tag/v2.2.1
`;

test('returns the body of a dated section up to the next heading', () => {
  assert.equal(changelogSection(changelog, '3.0.0'), '### Changed\n\n- Rewrite.');
});

test('excludes link reference definitions from the last section', () => {
  assert.equal(changelogSection(changelog, '2.2.1'), '- Old entry.');
});

test('returns null for a missing version', () => {
  assert.equal(changelogSection(changelog, '9.9.9'), null);
});

test('does not match a version that only shares a prefix', () => {
  assert.equal(changelogSection(changelog, '3.0'), null);
});

test('returns null for an empty section', () => {
  assert.equal(changelogSection('## [1.0.0]\n\n## [0.9.0]\n- x\n', '1.0.0'), null);
});

test('handles CRLF line endings', () => {
  assert.equal(changelogSection('## [1.0.0]\r\n- a\r\n', '1.0.0'), '- a');
});
