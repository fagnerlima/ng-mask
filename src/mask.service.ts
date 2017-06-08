import { Injectable } from '@angular/core';

import { MaskFactoryHandler } from './chain-of-responsibility/mask-factory/mask-factory-handler';
import { QueryStringMask } from './chain-of-responsibility/mask-factory/query-string-mask';
import { NumericMask } from './chain-of-responsibility/mask-factory/numeric-mask';
import { PredefinedTypeMask } from './chain-of-responsibility/mask-factory/predefined-type-mask';
import { DefaultMask } from './chain-of-responsibility/mask-factory/default-mask';
import { MaskFactory } from './strategy/mask-factory/mask-factory';
import { Mask } from './mask';

@Injectable()
export class MaskService {

  public createMask(mask: string): Mask {
    const maskFactoryHandler: MaskFactoryHandler = new QueryStringMask();
    maskFactoryHandler.append(new NumericMask());
    maskFactoryHandler.append(new PredefinedTypeMask());
    maskFactoryHandler.append(new DefaultMask());

    try {
      const maskFactory: MaskFactory = maskFactoryHandler.handle(mask);

      return maskFactory.create();
    } catch (error) {

      return null;
    }
  }
}
