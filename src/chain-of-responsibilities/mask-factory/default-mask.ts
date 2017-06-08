import { MaskFactoryHandler } from './mask-factory-handler';
import { MaskFactory } from '../../strategy/mask-factory/mask-factory';
import { DefaultMaskFactory } from '../../strategy/mask-factory/default-mask-factory';

export class DefaultMask extends MaskFactoryHandler {

  public handle(mask: string): MaskFactory {

    if (DefaultMaskFactory.isDefaultMask(mask)) {

      return new DefaultMaskFactory(mask);
    }
  }
}
