# NgMask

[![](https://img.shields.io/badge/npm-v2.0.2-brightgreen.svg)](https://www.npmjs.com/package/@fagnerlima/ng-mask)

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

    <input type="text" [(ngModel)]="money" [mask]="masks.money" />
  `
})
export class AppComponent {
  private readonly masks: { [type: string]: Mask } = {
    'date': { pattern: '00/00/0000', options: { placeholder: 'Date' } },
    'money': { pattern: '#.##0,00', options: { reverse: true } },
    'ipAddress': { pattern: '099.099.099.099' }
  };

  private money: number;
}
```
