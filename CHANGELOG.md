# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Framework-agnostic mask engine (`applyMask`, `applyMaskWithCaret`, `formatValue`) with jQuery
  Mask–compatible pattern syntax (`0`, `9`, `#`, `A`, `S`, custom `translation`), reverse masks,
  pattern lists that switch as the user types, and character transforms. When a literal equals the
  input, the reading that fits the whole input wins: typing `5` in `+55 (00) 00000-0000` gives
  `+55 (5`, pasting `5551999998888` keeps the country code, and typing `2` in `2000-00` gives
  `22`.
- Fixed-point number masks through the `scale` option, used by `brMoeda` and `decimal(p,s)`:
  `5` shows `0,05`, extra leading zeros are removed, numbers such as `1234.5` written from code or
  passed to the pipe show `1.234,50` (read exactly and rounded half up; exponent-notation and
  non-finite numbers give an empty field), and the raw output is a dot-decimal string
  (`1234.56`). Negative values are not supported.
- `MaskDirective` (`[mask]`) built on signal inputs and `ControlValueAccessor`, for reactive and
  template-driven forms or plain inputs, with correct caret handling when typing or deleting in the
  middle, paste and IME composition support.
- `maskOutput="raw"` to write only the typed characters to the model. Changing `mask` or
  `maskOutput` from code does not mark a pristine control dirty, including after
  `markAsPristine()`.
- `MaskPipe` (`{{ value | mask: 'brCpf' }}`) for display.
- Brazilian presets: `brCnpj` with the **alphanumeric CNPJ** (Receita Federal, from July 2026),
  `brCpfCnpj`, `brHora`, `brDataHora` and `brPlaca` (old and Mercosul plates).
- CPF and CNPJ check-digit validation: `cpfValidator`, `cnpjValidator` and `cpfCnpjValidator` for
  Angular forms, and the framework-agnostic `isValidCpf` and `isValidCnpj`.
- Demo application published to GitHub Pages: https://fagnerlima.github.io/ng-mask/
- README guidance on accessible fields (keyboard, autofill, labels and hints per preset) and
  known limitations.
- Automated releases: pushing a `vX.Y.Z` tag on a `master` commit publishes to npm with provenance
  (Trusted Publishing, gated by the `npm` environment) and creates the GitHub Release from this
  changelog.

### Changed

- **BREAKING:** complete rewrite with no runtime dependencies. The package no longer uses jQuery or
  jQuery Mask Plugin and declares no `dependencies` at all, only peer dependencies on
  `@angular/core` and `@angular/forms`.
- **BREAKING:** requires Angular 22.
- **BREAKING:** the model is updated on every keystroke (it used to be updated on blur only).
- **BREAKING:** `brCelular` is now `(00) 00000-0000`, and `brTelefone` adapts between landline
  `(00) 0000-0000` and mobile `(00) 00000-0000` numbers.
- **BREAKING:** `brMoeda` and `decimal(p,s)` are fixed-point masks: `5` shows `0,05` instead of `5`
  and their raw value is a dot-decimal string.
- **BREAKING:** `integer(p)` and `decimal(p,s)` throw an error unless the precision is 1 to 64 and
  the scale is 1 to `p - 1`; a `MaskConfig.scale` that is not an integer from 1 to 64 also throws.

### Removed

- **BREAKING:** `NgMaskModule`, `MaskService` and the `Mask` class. Import the standalone
  `MaskDirective` (and `MaskPipe`) instead, and pass a preset name, a pattern or a plain
  `MaskConfig` object (`{ pattern: '000', reverse: true }` instead of
  `new Mask('000', { reverse: true })`).
- **BREAKING:** the query-string mask format (`'#0.00?reverse=true'`). Use a `MaskConfig` object
  and the `maskClearIfNotMatch`, `maskSelectOnFocus` and `maskPlaceholder` inputs.

### Fixed

- `coordinateLat`/`coordinateLong` no longer accept `|` as a hemisphere and accept lower case.

## [2.2.1] - 2017-06-16

### Changed

- GitHub repository moved from `fagnerlima91` to `fagnerlima`.

## [2.2.0] - 2017-06-14

### Changed

- Extended compatibility: `@angular/core` and `@angular/forms` 2.4.10 or higher, jQuery 3.2.1 or
  higher and jQuery Mask Plugin 1.14.11 or higher.

## [2.1.4] - 2017-06-13

### Changed

- Updated the Angular dependencies.

## [2.1.3] - 2017-06-13

### Changed

- Downgraded the Angular dependencies.

### Fixed

- Project name in the `flatModuleId` TypeScript option.
- Name of a regular expression constant.

## [2.1.2] - 2017-06-09

### Fixed

- Numeric masks whose precision or scale has more than one digit.

## [2.1.1] - 2017-06-09

### Fixed

- Predefined masks `brCelular`, `brTelefone` and `coordinateLong`.

## [2.1.0] - 2017-06-08

### Added

- Mask types: predefined type, numeric, query string and default masks.

## [2.0.2] - 2017-06-05

### Fixed

- Null value checks in `MaskDirective`.

## [2.0.1] - 2017-06-04

### Added

- `CHANGELOG.md`.

### Fixed

- Passing null values to the mask directive.
- Type of the `pattern` attribute of the `Mask` interface.

## [2.0.0] - 2017-06-02

### Changed

- Merged the two directives into a single one.
- Added the `Mask` interface to type the directive input.

## [1.1.1] - 2017-04-25

### Changed

- Updated `README.md`.

## [1.1.0] - 2017-04-24

### Changed

- Changed how jQuery and jQuery Mask Plugin are imported.
- Updated dependency versions.

[Unreleased]: https://github.com/fagnerlima/ng-mask/compare/v2.2.0...HEAD
[2.2.1]: https://www.npmjs.com/package/@fagnerlima/ng-mask/v/2.2.1
[2.2.0]: https://github.com/fagnerlima/ng-mask/compare/v2.1.4...v2.2.0
[2.1.4]: https://github.com/fagnerlima/ng-mask/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/fagnerlima/ng-mask/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/fagnerlima/ng-mask/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/fagnerlima/ng-mask/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/fagnerlima/ng-mask/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/fagnerlima/ng-mask/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/fagnerlima/ng-mask/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/fagnerlima/ng-mask/compare/v1.1.1...v2.0.0
[1.1.1]: https://github.com/fagnerlima/ng-mask/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/fagnerlima/ng-mask/releases/tag/v1.1.0
