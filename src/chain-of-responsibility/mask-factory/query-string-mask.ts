import { MaskFactoryHandler } from './mask-factory-handler';
import { MaskFactory } from '../../strategy/mask-factory/mask-factory';
import { QueryStringMaskFactory } from '../../strategy/mask-factory/query-string-mask-factory';

export class QueryStringMask extends MaskFactoryHandler {

  public handle(mask: string): MaskFactory {
    if (QueryStringMaskFactory.isQueryStringMask(mask)) {

      return new QueryStringMaskFactory(mask);
    }

    return super.handle(mask);
  }
}
