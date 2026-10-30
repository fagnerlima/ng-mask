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
<!-- template-driven form -->
<input name="cep" [(ngModel)]="cep" mask="brCep" />

<!-- no forms -->
<input mask="00/00/0000" />
```

Use `type="text"` or `type="tel"`: browsers do not expose the caret of `type="number"` inputs. See
[Accessible fields](#accessible-fields) for the right attributes per preset.

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
| `brMoeda`        | `#.##0,00`, right to left, 2 decimals     | `1.234.567,89`        |
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
- `brMoeda` is a fixed-point mask: see [Money and decimal masks](#money-and-decimal-masks).
- `integer(p)` and `decimal(p,s)` from 2.x still work (`integer(6)`, `decimal(10,2)`). The
  precision must be 1 to 64 and the scale 1 to `p - 1`; other values throw an error.
  `decimal(p,s)` is a fixed-point mask like `brMoeda`, with `.` as the decimal separator.
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

Any other character is a literal, inserted automatically. When a literal equals what the user
typed, the reading that fits the whole input wins: with `+55 (00) 00000-0000`, typing `5` gives
`+55 (5` and `55999998888` gives `+55 (55) 99999-8888`, while pasting `+55 (51) 99999-8888` or
`5551999998888` keeps the country code. With `2000-00`, typing `2` gives `22`. For more control,
pass a `MaskConfig`:

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
A `MaskConfig` is `{ pattern: string | string[]; reverse?: boolean; translation?; scale?: number }`,
where `scale` is an integer from 1 to 64 (other values throw an `[ng-mask] Invalid mask` error).

## Money and decimal masks

A `scale` turns a reverse mask into a fixed-point number mask. `brMoeda` is
`{ pattern: '#.##0,00', reverse: true, scale: 2 }`:

| The user types / the model holds | The field shows     | `maskOutput="raw"` writes |
| -------------------------------- | ------------------- | ------------------------- |
| `5`                              | `0,05`              | `0.05`                    |
| `500`                            | `5,00`              | `5.00`                    |
| `0001`                           | `0,01`              | `0.01`                    |
| `123456`                         | `1.234,56`          | `1234.56`                 |
| model `1234.5` (number)          | `1.234,50`          | —                         |
| model `'1234.5'` or `'10'`       | `1.234,50`, `10,00` | —                         |
| model `0`                        | `0,00`              | —                         |
| model `'1234.565'`               | `1.234,57`          | —                         |
| model `1e21`, `NaN`, `Infinity`  | (empty)             | —                         |

- Digits fill the field from the right; extra leading zeros are removed. Deleting the last
  significant digit empties the field.
- Numbers and dot-decimal strings (`'1234.5'`) written from code or passed to the pipe are read
  as amounts, exactly (as text, without floating-point rounding), and **rounded half up** to
  `scale` decimals. Numbers that JavaScript writes in exponent notation (`1e21`, `1e-7`) and
  non-finite numbers give an empty field. Other strings are read as typed text.
- A fixed-length pattern such as `decimal(5,2)` keeps the rightmost digits of a longer amount,
  whether typed or written from code: `123456.78` shows `456.78`. Choose a precision that fits
  your amounts, or use a recursive pattern like `brMoeda`.
- The raw output is a dot-decimal string with exactly `scale` decimals: use `Number(value)` to get
  a number. The masked output (the default) is the text shown in the field.
- **Negative values are not supported**: the minus sign is dropped.

## Directive inputs

| Input                 | Type                                 | Default    | Description                                                                       |
| --------------------- | ------------------------------------ | ---------- | --------------------------------------------------------------------------------- |
| `mask`                | preset name, pattern or `MaskConfig` | required   | The mask. An empty value disables masking.                                        |
| `maskOutput`          | `'masked' \| 'raw'`                  | `'masked'` | Writes `123.456.789-09` or `12345678909` to the form model (`1234.56` for money). |
| `maskClearIfNotMatch` | `boolean`                            | `false`    | Clears the field on blur if the mask is not completely filled.                    |
| `maskSelectOnFocus`   | `boolean`                            | `false`    | Selects the whole value on focus.                                                 |
| `maskPlaceholder`     | `string`                             | —          | Sets the `placeholder` attribute; unsetting it restores the original one.         |

- Values written to the model from code (`setValue`, `ngModel`) are formatted for display, whether
  they are raw or already masked. They are not rewritten in the model.
- Changing `mask` or `maskOutput` re-formats the field. If the value was written from code, or
  the control is pristine (for example after `markAsPristine()`), the model is left as is and no
  `valueChanges` is emitted. Otherwise the re-formatted value is written to the model like any
  edit.
- `maskClearIfNotMatch` clears the field silently, which can surprise users and screen-reader
  users. Prefer a validator with a visible error message.

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
{{ 1234.5 | mask: 'brMoeda' }}
<!-- 1.234,50 -->
{{ '1234' | mask: { pattern: '00-00' } }}
<!-- 12-34 -->
```

`null` and `undefined` are rendered as an empty string.

## Using the engine directly

The engine has no Angular dependency and can format values anywhere:

```typescript
import { applyMask, formatValue, resolveMask } from '@fagnerlima/ng-mask';

applyMask('12abc34501de35', resolveMask('brCnpj')!);
// { masked: '12.ABC.345/01DE-35', raw: '12ABC34501DE35', complete: true }

formatValue(1234.5, resolveMask('brMoeda')!);
// { masked: '1.234,50', raw: '1234.50', complete: true }
```

`applyMask` reads text as typed by the user; `formatValue` also reads numbers, as the pipe and
the directive do for values written from code.

## Accessible fields

The mask does not choose the keyboard or autofill. Set these attributes on the input:

| Preset                                                        | Input attributes                                    |
| ------------------------------------------------------------- | --------------------------------------------------- |
| `brCpf`, `brCep`, `brData`, `brHora`, `brDataHora`, `brMoeda` | `inputmode="numeric"`                               |
| `brCnpj`, `brCpfCnpj`                                         | `inputmode="text" autocapitalize="characters"` (\*) |
| `brTelefone`, `brCelular`                                     | `type="tel" autocomplete="tel-national"`            |
| `brCep`                                                       | also `autocomplete="postal-code"`                   |
| `brPlaca`                                                     | `autocapitalize="characters"`                       |

(\*) A numeric keyboard would block the letters of the alphanumeric CNPJ, issued from July 2026.
Use `tel-national` rather than `tel`: autofilled `+55 …` numbers do not fit the mask.

```html
<label for="cpf">CPF</label>
<input
  id="cpf"
  mask="brCpf"
  inputmode="numeric"
  aria-describedby="cpf-hint"
  formControlName="cpf"
/>
<p id="cpf-hint">Format: 000.000.000-00</p>
```

- Always use a visible `<label>`; a placeholder is not a label and disappears while typing.
- Put the expected format in a hint linked with `aria-describedby`, and link error messages the
  same way with `aria-invalid="true"`.
- Do not set `maxlength` shorter than the longest pattern, literals included (18 characters for
  `brCnpj`), or the browser cuts the value before the mask formats it.

## Known limitations

- **IME composition** (for example some Android keyboards) is masked when the composition ends,
  so the text may appear unformatted until then.
- **Browser undo** (Ctrl+Z) does not know about the formatting the mask applied and may restore
  intermediate values.
- **Pasting more characters than the mask holds** truncates the value: fixed-length masks keep
  the first characters (reverse ones the last) and drop the rest.
- **Negative numbers** are not supported by money and decimal masks.

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
| `brMoeda`: `5` shows `5`                    | fixed-point: `5` shows `0,05`; raw output is `0.05`                            |
| `decimal(p,s)`                              | fixed-point like `brMoeda`; invalid precision or scale throws                  |

## Development

Requires Node 24 and npm 11.5.1 or later (npm warns on older versions; publishing needs it).

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

Releases are only published from tags on commits that are already on `master`.

1. In a pull request, move the `Unreleased` entries of [`CHANGELOG.md`](CHANGELOG.md) to a new
   `## [X.Y.Z] - YYYY-MM-DD` section and merge it.
2. Tag the merge commit and push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. The workflow checks that `CHANGELOG.md` has the `X.Y.Z` section, lints, tests and builds, sets
   the package version from the tag, publishes to npm with provenance and creates the GitHub
   Release with that changelog section. Tags with a suffix (`v3.1.0-rc.1`) are published with the
   `next` dist-tag and marked as pre-releases.

One-time setup:

- In the repository settings, under **Environments**, create an environment named `npm` with a
  **required reviewer** and a deployment rule that only allows tags matching `v*.*.*`. The publish
  job runs in this environment, so every release waits for approval.
- On [npmjs.com](https://www.npmjs.com/package/@fagnerlima/ng-mask/access), add a **Trusted
  Publisher** for GitHub Actions with repository `fagnerlima/ng-mask`, workflow `release.yml` and
  environment `npm`. No `NPM_TOKEN` secret is needed.
- Under **Rules → Rulesets**, add a tag ruleset for `refs/tags/v*` that restricts creation,
  update and deletion to maintainers.
- After the first trusted publish, set the package's publishing access on npmjs.com to **Require
  two-factor authentication and disallow tokens**, and revoke any old automation tokens.
- In the repository settings, under **Pages**, set the source to **GitHub Actions**. The demo is
  deployed by [`.github/workflows/pages.yml`](.github/workflows/pages.yml) on every push to
  `master`.

## License

[MIT](LICENSE.md) © Fagner Lima
