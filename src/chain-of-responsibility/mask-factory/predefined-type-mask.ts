import { MaskFactoryHandler } from './mask-factory-handler';
import { MaskFactory } from '../../strategy/mask-factory/mask-factory';
import { PredefinedTypeMaskFactory } from '../../strategy/mask-factory/predefined-type-mask-factory';

export class PredefinedTypeMask extends MaskFactoryHandler {

  public handle(mask: string): MaskFactory {
    if (PredefinedTypeMaskFactory.getTypes().indexOf(mask) >= 0) {

      return new PredefinedTypeMaskFactory(mask);
    }

    return super.handle(mask);
  }
}
