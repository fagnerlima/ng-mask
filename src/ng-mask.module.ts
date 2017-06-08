import { NgModule } from '@angular/core';

import { MaskDirective } from './mask.directive';

@NgModule({
  declarations: [MaskDirective],
  exports: [MaskDirective]
})
export class NgMaskModule { }
