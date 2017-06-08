import { MaskFactory } from '../../strategy/mask-factory/mask-factory';
import { MaskPatternNotFoundError } from '../../strategy/mask-factory/error/mask-pattern-not-found-error';

export abstract class MaskFactoryHandler {

  private nextHandler: MaskFactoryHandler;

  public append(handler: MaskFactoryHandler) {
    if (this.nextHandler) {
      this.nextHandler.append(handler);
    } else {
      this.nextHandler = handler;
    }
  }

  public handle(mask: string): MaskFactory {
    if (this.nextHandler) {

      return this.nextHandler.handle(mask);
    }

    throw new MaskPatternNotFoundError('Mask pattern not found.');
  }
}
