import { MaskFactoryHandler } from './mask-factory-handler';
import { MaskFactory } from '../../strategy/mask-factory/mask-factory';
import { NumericMaskFactory } from '../../strategy/mask-factory/numeric-mask-factory';

export class NumericMask extends MaskFactoryHandler {

  public handle(mask: string): MaskFactory {

    if (NumericMaskFactory.isNumericMask(mask)) {

      return new NumericMaskFactory(mask);
    }

    return super.handle(mask);
  }
}
