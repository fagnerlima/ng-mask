// Prints the CHANGELOG.md section of a version, to be used as GitHub Release notes.
// Usage: node scripts/changelog-section.mjs <version> [changelogPath]
// Exits with an error when the section is missing or empty, which blocks a release whose
// changelog was not updated.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Returns the body of the `## [version]` section (without its heading), or null. */
export function changelogSection(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const heading = `## [${version}]`;
  const start = lines.findIndex((line) => line === heading || line.startsWith(`${heading} `));

  if (start === -1) {
    return null;
  }

  const next = lines.findIndex((line, index) => index > start && /^## /.test(line));
  const body = lines
    .slice(start + 1, next === -1 ? undefined : next)
    .filter((line) => !/^\[[^\]]+\]:\s/.test(line))
    .join('\n')
    .trim();

  return body === '' ? null : body;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [version, path = 'CHANGELOG.md'] = process.argv.slice(2);

  if (!version) {
    console.error('Usage: node scripts/changelog-section.mjs <version> [changelogPath]');
    process.exit(2);
  }

  const section = changelogSection(readFileSync(path, 'utf8'), version);

  if (section === null) {
    console.error(`${path} has no non-empty "## [${version}]" section.`);
    process.exit(1);
  }

  console.log(section);
}
