# NgMask

[![](https://img.shields.io/badge/npm-v2.1.0--beta.1-brightgreen.svg)](https://www.npmjs.com/package/@fagnerlima/ng-mask)

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

3. Insert the directives in form's components with ngControl (ex. ngModel or formControlName):

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

  protected money: string;
  protected maskMoney: string = '#0.00?reverse=true';
}
```

## Mask's Types

### Mask Object

Instance of Mask class.

```typescript
import { Mask } from '@fagnerlima/ng-mask';

const dateMask: Mask = new Mask('00/00/0000');
const percentMask: Mask = new Mask('##0,00%', { reverse: true })
```

### Default Mask

String that represents pattern attribute of Mask class, using default patterns of jQueryMaskPlugin, without extra options.

```typescript
const dateMask: string = '00/00/0000';
```

### QueryString Mask

String in the QueryString format that contains the pattern and extra options of Mask class.

*At the moment, only reverse option is supported.*

```typescript
const percentMaskMask: string = '##0,00%?reverse=true';
```

### Predefined Type Mask

String that contains a predefined type.

```typescript
const coordinateLatMask: string = 'coordinate-lat';
const coordinateLongMask: string = 'coordinate-long';
```

| Predefined Types |
|------------------|
| br-cep           |
| br-data          |
| br-cnpj          |
| br-cpf           |
| br-celular       |
| coordinate-lat   |
| coordinate-long  |

### Numeric Mask

String that contains a numeric type (**integer** or **decimal**) with your **precision** (and **scale** for decimal type).

```typescript
const integerMask: string = 'integer(6)';
const decimalMask: string = 'decimal(10,2)';
```
