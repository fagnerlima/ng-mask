# ng-mask

[![npm](https://img.shields.io/npm/v/@fagnerlima/ng-mask.svg)](https://www.npmjs.com/package/@fagnerlima/ng-mask)
[![CI](https://github.com/fagnerlima/ng-mask/actions/workflows/ci.yml/badge.svg)](https://github.com/fagnerlima/ng-mask/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

Input masks for Angular with **zero runtime dependencies** and **Brazilian masks ready to use**,
including the new **alphanumeric CNPJ**, plus CPF/CNPJ validators.

**[Live demo](https://fagnerlima.github.io/ng-mask/)**

```html
<input mask="brCpfCnpj" formControlName="document" />
<!-- 123.456.789-09 or 12.ABC.345/01DE-35, switching as the user types -->
```

## Why ng-mask

- **Zero dependencies.** No jQuery, no third-party mask library, not even `tslib`: only peer
  dependencies on `@angular/core` and `@angular/forms`.
- **Brazilian masks out of the box.** CPF, CNPJ (numeric and the alphanumeric format issued by
  Receita Federal from July 2026), CPF-or-CNPJ, landline/mobile phone, CEP, dates, money and
  old/Mercosul license plates.
- **CPF and CNPJ validators** that check the verification digits, alphanumeric CNPJ included.
- **Modern Angular.** A standalone directive with signal inputs that works as the
  `ControlValueAccessor` of reactive and template-driven forms, handles the caret when editing in
  the middle, paste and IME composition. Plus a pipe for display.
- **Small and testable.** The mask engine is plain TypeScript with no Angular imports.

## Installation

```bash
npm install @fagnerlima/ng-mask
```

| ng-mask | Angular |
| ------- | ------- |
| 3.x     | 22      |
| 2.x     | 2.4 – 4 |

## Quick start

Import the standalone directive (and the pipe, if you need it) where you use it:

```typescript
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaskDirective, MaskPipe, cpfValidator } from '@fagnerlima/ng-mask';

@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule, MaskDirective, MaskPipe],
  template: `
    <form [formGroup]="form">
      <input formControlName="cpf" mask="brCpf" maskOutput="raw" />
      <input formControlName="phone" mask="brTelefone" />
      <input formControlName="amount" mask="brMoeda" inputmode="numeric" />
    </form>

    <p>CPF: {{ form.value.cpf | mask: 'brCpf' }}</p>
  `,
})
export class CustomerForm {
  readonly form = new FormGroup({
    cpf: new FormControl('', [Validators.required, cpfValidator]),
    phone: new FormControl(''),
    amount: new FormControl(''),
  });
}
```

It works the same with `[(ngModel)]` and on plain inputs without forms:

```html
<input name="cep" [(ngModel)]="cep" mask="brCep" /> <input mask="00/00/0000" placeholder="Date" />
```

Use `type="text"` or `type="tel"`: browsers do not expose the caret of `type="number"` inputs.

## Presets

| Preset           | Pattern                                   | Example               |
| ---------------- | ----------------------------------------- | --------------------- |
| `brCpf`          | `000.000.000-00`                          | `123.456.789-09`      |
| `brCnpj`         | `XX.XXX.XXX/XXXX-00` (X: letter or digit) | `12.ABC.345/01DE-35`  |
| `brCpfCnpj`      | CPF, switching to CNPJ                    | `12.345.678/0001-95`  |
| `brTelefone`     | `(00) 0000-0000` or `(00) 00000-0000`     | `(83) 3638-8973`      |
| `brCelular`      | `(00) 00000-0000`                         | `(11) 95683-1298`     |
| `brCep`          | `00000-000`                               | `58035-110`           |
| `brData`         | `00/00/0000`                              | `15/10/2026`          |
| `brHora`         | `00:00`                                   | `23:59`               |
| `brDataHora`     | `00/00/0000 00:00`                        | `15/10/2026 23:59`    |
| `brMoeda`        | `#.##0,00`, right to left                 | `1.234.567,89`        |
| `brPlaca`        | `LLL-0000` or `LLL0L00` (L: letter)       | `ABC-1234`, `BRA2E19` |
| `usPhone`        | `(000) 000-0000`                          | `(581) 555-5895`      |
| `date`           | `00/00/0000`                              | `01/31/2026`          |
| `time`           | `00:00:00`                                | `19:15:00`            |
| `dateTime`       | `00/00/0000 00:00:00`                     | `05/18/2026 08:30:00` |
| `coordinateLat`  | `000º00.0000'~` (~: `N` or `S`)           | `123º54.7894'N`       |
| `coordinateLong` | `000º00.0000'~` (~: `E` or `W`)           | `354º79.6452'E`       |

- Letters in `brCnpj`, `brCpfCnpj`, `brPlaca` and the coordinates are converted to upper case.
- Masks with two patterns pick the first one that holds what was typed, so `brTelefone` becomes a
  mobile number at the eleventh digit and `brPlaca` becomes Mercosul when a letter is typed in the
  fifth position. `brCpfCnpj` switches to CNPJ at the twelfth character or at the first letter.
- `integer(p)` and `decimal(p,s)` from 2.x still work (`integer(6)`, `decimal(10,2)`).
- All presets are exported as `NG_MASK_PRESETS`.

## Custom masks

Any string that is not a preset is a pattern. The syntax follows
[jQuery Mask Plugin](https://igorescobar.github.io/jQuery-Mask-Plugin/):

| Token | Accepts                       |
| ----- | ----------------------------- |
| `0`   | a digit                       |
| `9`   | an optional digit             |
| `#`   | a digit, repeated (recursive) |
| `A`   | a letter or digit             |
| `S`   | a letter                      |

Any other character is a literal, inserted automatically. For more control, pass a `MaskConfig`:

```typescript
import { MaskConfig } from '@fagnerlima/ng-mask';

// Percentage typed from right to left: 12,50%
const percent: MaskConfig = { pattern: '##0,00%', reverse: true };

// Custom token: hexadecimal colour code, upper-cased: FF00AA
const color: MaskConfig = {
  pattern: 'HHHHHH',
  translation: {
    H: { pattern: /[0-9a-f]/i, transform: (char) => char.toUpperCase() },
  },
};

// Several patterns: the first one that holds the whole input wins
const zip: MaskConfig = { pattern: ['00000', '00000-0000'] };
```

```html
<input [mask]="percent" />
```

A token is `{ pattern: RegExp; optional?: boolean; recursive?: boolean; transform?: (char) => string }`.

## Directive inputs

| Input                 | Type                                 | Default    | Description                                                    |
| --------------------- | ------------------------------------ | ---------- | -------------------------------------------------------------- |
| `mask`                | preset name, pattern or `MaskConfig` | required   | The mask. An empty value disables masking.                     |
| `maskOutput`          | `'masked' \| 'raw'`                  | `'masked'` | Writes `123.456.789-09` or `12345678909` to the form model.    |
| `maskClearIfNotMatch` | `boolean`                            | `false`    | Clears the field on blur if the mask is not completely filled. |
| `maskSelectOnFocus`   | `boolean`                            | `false`    | Selects the whole value on focus.                              |
| `maskPlaceholder`     | `string`                             | —          | Sets the `placeholder` attribute.                              |

Values written to the model from code (`setValue`, `ngModel`) are formatted for display, whether
they are raw or already masked. They are not rewritten in the model.

## Validators

```typescript
import { cnpjValidator, cpfCnpjValidator, cpfValidator } from '@fagnerlima/ng-mask';

new FormControl('', [Validators.required, cnpjValidator]);
```

| Validator          | Error key | Accepts                                              |
| ------------------ | --------- | ---------------------------------------------------- |
| `cpfValidator`     | `cpf`     | CPF with valid check digits                          |
| `cnpjValidator`    | `cnpj`    | numeric or alphanumeric CNPJ with valid check digits |
| `cpfCnpjValidator` | `cpfCnpj` | a valid CPF (11 digits) or a valid CNPJ              |

- Masked and raw values are accepted (`.`, `/`, `-` and spaces are ignored).
- Empty values are valid: combine with `Validators.required` when the field is mandatory.
- Sequences of a single repeated character (`111.111.111-11`) are rejected.
- Alphanumeric CNPJ letters must be upper case, as `brCnpj` writes them. Each character is worth
  its ASCII code minus 48 in the check-digit calculation, as defined by Receita Federal.

The same checks are available without Angular as `isValidCpf(value)` and `isValidCnpj(value)`.

## Pipe

```html
{{ '12345678909' | mask: 'brCpf' }}
<!-- 123.456.789-09 -->
{{ '12abc34501de35' | mask: 'brCnpj' }}
<!-- 12.ABC.345/01DE-35 -->
{{ 123456 | mask: { pattern: '#.##0,00', reverse: true } }}
<!-- 1.234,56 -->
```

`null` and `undefined` are rendered as an empty string.

## Using the engine directly

The engine has no Angular dependency and can format values anywhere:

```typescript
import { applyMask, resolveMask } from '@fagnerlima/ng-mask';

applyMask('12abc34501de35', resolveMask('brCnpj')!);
// { masked: '12.ABC.345/01DE-35', raw: '12ABC34501DE35', complete: true }
```

## Migrating from 2.x

Version 3 is a rewrite. jQuery and jQuery Mask Plugin are no longer used, so remove them from
your dependencies and scripts if nothing else uses them.

| 2.x                                         | 3.x                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `imports: [NgMaskModule]`                   | `imports: [MaskDirective]` (standalone, also `MaskPipe`)                       |
| `[mask]="'brCpf'"`, `mask="00/00/0000"`     | unchanged: the selector is still `[mask]`                                      |
| `new Mask('##0,00%', { reverse: true })`    | `{ pattern: '##0,00%', reverse: true }`                                        |
| `'##0,00%?reverse=true&placeholder=0,00%'`  | `[mask]="{ pattern: '##0,00%', reverse: true }"` and `maskPlaceholder="0,00%"` |
| `clearIfNotMatch` / `selectOnFocus` options | `maskClearIfNotMatch` / `maskSelectOnFocus` inputs                             |
| `translation: { '~': { pattern: /[NS]/ } }` | unchanged, plus an optional `transform`                                        |
| `MaskService.createMask(...)`               | `resolveMask(...)` and `applyMask(...)`                                        |
| model updated on blur                       | model updated on every change (`maskOutput` picks masked or raw)               |
| `brCelular`: `(00) 00009-0000`              | `(00) 00000-0000`; use `brTelefone` for landline or mobile                     |

## Development

```bash
npm ci
npm start                # demo at http://localhost:4200
npm test                 # unit tests (Vitest) for the library and the demo
npm run lint             # angular-eslint
npm run build            # library (dist/ng-mask) and demo (dist/demo)
npm run pack:check       # verifies the packed library has no dependencies
```

## Releasing

Releases are fully automated by [`.github/workflows/release.yml`](.github/workflows/release.yml):

1. In a pull request, move the `Unreleased` entries of [`CHANGELOG.md`](CHANGELOG.md) to a new
   `## [X.Y.Z] - YYYY-MM-DD` section and merge it.
2. Tag the merge commit and push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. The workflow checks that `CHANGELOG.md` has the `X.Y.Z` section, lints, tests and builds, sets
   the package version from the tag, publishes to npm with provenance and creates the GitHub
   Release with that changelog section. Tags with a suffix (`v3.1.0-rc.1`) are published with the
   `next` dist-tag and marked as pre-releases.

One-time setup:

- On [npmjs.com](https://www.npmjs.com/package/@fagnerlima/ng-mask/access), add a **Trusted
  Publisher** for GitHub Actions with repository `fagnerlima/ng-mask` and workflow `release.yml`.
  No `NPM_TOKEN` secret is needed.
- In the repository settings, under **Pages**, set the source to **GitHub Actions**. The demo is
  deployed by [`.github/workflows/pages.yml`](.github/workflows/pages.yml) on every push to
  `master`.

## License

[MIT](LICENSE.md) © Fagner Lima
