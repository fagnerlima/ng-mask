#NgMask

[![](https://img.shields.io/badge/npm-v1.0.8-brightgreen.svg)](https://www.npmjs.com/package/@fagnerlima/ng-mask)

NgMask is a jQuery Mask Plugin Adapter for Angular
(that uses [jquery-mask-plugin](https://github.com/igorescobar/jQuery-Mask-Plugin)).

##Requirements

* [jQuery](https://www.npmjs.com/package/jquery)
* [jquery-mask-plugin](https://www.npmjs.com/package/jquery-mask-plugin)

##Usage

1. Install ng-mask using npm:

```
npm install @fagnerlima/ng-mask
```

2. Include js files in angular-cli.json:

```
"scripts": [
  "../node_modules/jquery/dist/jquery.min.js",
  "../node_modules/jquery-mask-plugin/dist/jquery.mask.min.js"
]
```

3. Add NgMaskModule into AppModule class:

```typescript
import { BrowserModule }  from '@angular/platform-browser';
import { NgModule }       from '@angular/core';
import { FormsModule }    from '@angular/forms';

import { AppComponent } from './app.component';
import { NgMaskModule } from '@fagnerlima/ng-mask';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    NgMaskModule
  ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

4. Insert the directives in form's components with ngControl (ex. ngModel or formControlName):

```typescript
import { Component } from '@angular/core';

import { MaskOptions } from '@fagnerlima/ng-mask';

@Component({
  selector: 'app-root',
  template: `
    <h1>NgMask</h1>

    <input type="text" [(ngModel)]="money" [mask]="masks.money.mask" [maskOptions]="masks.money.options" />
  `
})
export class AppComponent {
  private readonly masks: { [type: string]: { mask: string, options?: MaskOptions } } = {
    'date': { mask: '00/00/0000', options: { placeholder: 'Date' } },
    'money': { mask: '#.##0,00', options: { reverse: true } },
    'ipAddress': { mask: '099.099.099.099' }
  };

  private money: number;
}
```

**NgMask Directives:**

* **mask**: string (required);
* **maskOptions**: implements MaskOptions Interface (optional).
