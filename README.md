# NgMask

[![](https://img.shields.io/badge/npm-v2.1.0--beta.2-brightgreen.svg)](https://www.npmjs.com/package/@fagnerlima/ng-mask)

NgMask is a [jQueryMaskPlugin](https://github.com/igorescobar/jQuery-Mask-Plugin) Adapter for Angular.

## Requirements

* [jQuery](https://www.npmjs.com/package/jquery)
* [jQueryMaskPlugin](https://www.npmjs.com/package/jquery-mask-plugin)

## Usage

1. Install ng-mask using npm:

```
npm install @fagnerlima/ng-mask
```

2. Import NgMaskModule into Module class:

```typescript
// ...
import { NgMaskModule } from '@fagnerlima/ng-mask';

@NgModule({
  imports: [
    // ...
    NgMaskModule
  ],
  // ...
})
export class AppModule { }
```

3. Insert the directives in form's inputs with ngControl (ex. ngModel or formControlName):

```typescript
import { Component } from '@angular/core';

import { Mask } from '@fagnerlima/ng-mask';

@Component({
  selector: 'app-root',
  template: `
    <h1>NgMask</h1>

    <input type="text" [(ngModel)]="money" [mask]="maskMoney" />
  `
})
export class AppComponent {

  // Masks
  readonly maskCep: string = 'br-cep';
  readonly maskCoordinateLat: string = 'coordinate-lat';
  readonly maskCoordinateLong: string = 'coordinate-long';
  readonly maskDecimal: string = 'decimal(5,2)';
  readonly maskInteger: string = 'integer(6)';
  readonly maskMoney: string = '#0.00?reverse=true';
  readonly maskPhone: string = '(00) 90000-0000';
  readonly maskCpf: Mask = new Mask('000.000.000-00');

  // Controls
  money: string;
}
```

## Mask Types

### Mask Object

Instance of Mask class.

```typescript
import { Mask } from '@fagnerlima/ng-mask';

const dateMask: Mask = new Mask('00/00/0000');
const percentMask: Mask = new Mask('##0,00%', { reverse: true })
```

### Default Mask

String that represents pattern attribute of Mask class, using default jokers of jQueryMaskPlugin, without extra options.

```typescript
const dateMask: string = '00/00/0000';
```

| Patterns | jQueryMaskPlugin's Default Configuration |
|-|-|
| 0 | { pattern: /\d/ } |
| 9 | { pattern: /\d/, optional: true } |
| # | { pattern: /\d/, recursive: true } |
| A | { pattern: /[a-zA-Z0-9/ } |
| S | { pattern: /[a-zA-Z]/ } |

### QueryString Mask

String in the QueryString format that contains the pattern and extra options of Mask class.

```typescript
const percentMaskMask: string = '##0,00%?reverse=true&placeholder=000,00%';
```

| Supported Extra Options |
|-|
| clearIfNotMatch |
| placeholder |
| reverse |
| selectOnFocus |

### Predefined Type Mask

String that contains a predefined type.

```typescript
const coordinateLatMask: string = 'coordinate-lat';
const coordinateLongMask: string = 'coordinate-long';
```

| Predefined Types | Pattern |
|-|-|
| brCelular | new Mask('(00) 90000-0000') |
| brCep | new Mask('00000-000') |
| brCnpj | new Mask('00.000.000/0000-00') |
| brCpf | new Mask('000.000.000-00') |
| brData | new Mask('00/00/0000') |
| brMoeda | new Mask('#.##0,00', { reverse: true }) |
| brTelefone | new Mask('(00) 90000-0000') |
| usPhone | new Mask('(000) 000-0000') |
| coordinateLat | new Mask('000º00.0000\'~', { translation: { '~': { pattern: /[N|S]/ } } }) |
| coordinateLong | new Mask('000º00.0000\'~', { translation: { '~': { pattern: /[N|S]/ } } }) |
| date | new Mask('00/00/0000') |
| dateTime | new Mask('00/00/0000 00:00:00') |
| time | new Mask('00:00:00') |

### Numeric Mask

String that contains a numeric type with your **precision** (and **scale** for decimal type), similar to many databases.

```typescript
const integerMask: string = 'integer(6)';
const decimalMask: string = 'decimal(10,2)';
```

| Numeric Types | Examples |
|-|-|
| integer | integer(6) |
| decimal | decimal(5,2) |
