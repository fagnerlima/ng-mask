import { MaskFactory } from './mask-factory';
import { Mask } from '../../mask';

const numericMaskRegex: RegExp = /^(integer\(\d+\)|decimal\(\d+,\d+\))$/;

export class NumericMaskFactory extends MaskFactory {

  public static isNumericMask(mask: string): boolean {

    return numericMaskRegex.test(mask);
  }

  public create(): Mask {
    if (!NumericMaskFactory.isNumericMask(this.mask)) {

      return null;
    }

    const numberMaskRegex: RegExp = /^(decimal|integer)\((\d+|\d+,\d+)\)$/;
    const numberType: string = numberMaskRegex.exec(this.mask)[1];
    const numberDefinition: string = numberMaskRegex.exec(this.mask)[2];

    if ('integer' === numberType) {
      const precision: number = parseInt(numberDefinition, 10);

      this.mountIntegerMask(precision);
    } else {
      const definitions: string[] = numberDefinition.split(',');
      const precision: number = parseInt(definitions[0], 10);
      const scale: number = parseInt(definitions[1], 10);

      this.mountDecimalMask(precision, scale);
    }

    return new Mask(this.pattern, this.options);
  }

  private mountIntegerMask(precision: number) {
    let pattern = '';

    for (let i = 1; i <= precision; i++) {
      pattern += '0';
    }

    this.pattern = pattern;
  }

  private mountDecimalMask(precision: number, scale: number) {
    let pattern = '';

    for (let i = 1; i <= precision - scale; i++) {
      pattern += '0';
    }

    pattern += '.';

    for (let i = 1; i <= scale; i++) {
      pattern += '0';
    }

    this.pattern = pattern;
    this.options.reverse = true;
  }
}
