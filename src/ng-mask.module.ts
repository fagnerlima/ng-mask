import { NgModule } from '@angular/core';

import { MaskDirective } from './mask.directive';

/**
 * @author Fagner Lima
 * @since 1.0.0
 */
@NgModule({
  declarations: [ MaskDirective ],
  exports: [ MaskDirective ]
})
export class NgMaskModule {}
