# NgMask

[![](https://img.shields.io/badge/npm-v2.2.0-brightgreen.svg)](https://www.npmjs.com/package/@fagnerlima/ng-mask)

NgMask is a [jQueryMaskPlugin](https://github.com/igorescobar/jQuery-Mask-Plugin) Adapter for Angular.

## Dependencies

- [@angular/core](https://www.npmjs.com/package/@angular/core): 2.4.10 or higher;
- [@angular/forms](https://www.npmjs.com/package/@angular/forms): 2.4.10 or higher;
- [jQuery](https://www.npmjs.com/package/jquery): 3.2.1 or higher;
- [jQueryMaskPlugin](https://www.npmjs.com/package/jquery-mask-plugin): 1.14.11 or higher.

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

3. Insert the directive in form inputs with ngControl (ex. ngModel or formControlName):

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
  readonly maskCep: string = 'brCep';
  readonly maskCoordinateLat: string = 'coordinateLat';
  readonly maskCoordinateLong: string = 'coordinateLong';
  readonly maskCpf: Mask = new Mask('000.000.000-00');
  readonly maskDecimal: string = 'decimal(10,2)';
  readonly maskInteger: string = 'integer(6)';
  readonly maskMoney: string = '#0.00?reverse=true';
  readonly maskPhone: string = '(00) 00000-0000';

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
const percentMask: string = '##0,00%?reverse=true&placeholder=000,00%';
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
const coordinateLatMask: string = 'coordinateLat';
const coordinateLongMask: string = 'coordinateLong';
```

| Predefined Types | Pattern | Example |
|-|-|-|
| brCelular | new Mask('(00) 00009-0000') | (11) 95683-1298 |
| brCep | new Mask('00000-000') | 58035-110 |
| brCnpj | new Mask('00.000.000/0000-00') | 13.456.131/0000-12 |
| brCpf | new Mask('000.000.000-00') | 034.465.789-13 |
| brData | new Mask('00/00/0000') | 15/10/2016 |
| brMoeda | new Mask('#.##0,00', { reverse: true }) | 2.199,99 |
| brTelefone | new Mask('(00) 0000-0000') | (83) 3638-8973 |
| usPhone | new Mask('(000) 000-0000') | (581) 555-5895 |
| coordinateLat | new Mask('000º00.0000\\'\~', { translation: { '\~': { pattern: /[N\|S]/ } } }) | 123º54.7894'N |
| coordinateLong | new Mask('000º00.0000\\'\~', { translation: { '\~': { pattern: /[E\|W]/ } } }) | 354º79.6452'E |
| date | new Mask('00/00/0000') | 01/31/2017 |
| dateTime | new Mask('00/00/0000 00:00:00') | 05/18/2017 08:30:00 |
| time | new Mask('00:00:00') | 19:15:00 |

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
