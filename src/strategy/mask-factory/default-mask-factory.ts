import { MaskFactory } from './mask-factory';
import { Mask } from '../../mask';

const defaultMaskRegex: RegExp = /[09#AS]/;

export class DefaultMaskFactory extends MaskFactory {

  public static isDefaultMask(mask: string): boolean {

    return defaultMaskRegex.test(mask);
  }

  public create(): Mask {
    if (!DefaultMaskFactory.isDefaultMask(this.mask)) {

      return null;
    }

    this.pattern = this.mask;

    return new Mask(this.pattern);
  }
}
