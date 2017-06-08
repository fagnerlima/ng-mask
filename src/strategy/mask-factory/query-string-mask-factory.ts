import { MaskFactory } from './mask-factory';
import { Mask } from '../../mask';

const queryStringMaskegex: RegExp = /^[^?]+\?([a-zA-Z][a-zA-Z\d-_]+=[^&?=]+)(&([a-zA-Z][a-zA-Z\d-_]+=[^&?=]+))*$/;

export class QueryStringMaskFactory extends MaskFactory {

  public static isQueryStringMask(mask: string): boolean {

    return queryStringMaskegex.test(mask);
  }

  public create(): Mask {
    this.initPattern();
    this.buildOptions();

    return new Mask(this.pattern, this.options);
  }

  private initPattern() {
    this.pattern = this.mask.split('?')[0];
  }

  private buildOptions() {
    const queryString: string = this.mask.split('?')[1];
    const options: string[] = queryString.split('&');

    for (const option of options) {
      if (option.startsWith('placeholder')) {
        this.setOptionPlaceholder(option);
      } else if (option.startsWith('reverse')) {
        this.setOptionReverse(option);
      } else if (option.startsWith('clearIfNotMatch')) {
        this.setOptionClearIfNotMatch(option);
      } else if (option.startsWith('selectOnFocus')) {
        this.setOptionSelectOnFocus(option);
      }
    }
  }

  private setOptionPlaceholder(option: string) {
    this.options.placeholder = option.split('=')[1];
  }

  private setOptionReverse(option: string) {
    this.options.reverse = 'true' === option.split('=')[1] ? true : false;
  }

  private setOptionClearIfNotMatch(option: string) {
    this.options.clearIfNotMatch = 'true' === option.split('=')[1] ? true : false;
  }

  private setOptionSelectOnFocus(option: string) {
    this.options.selectOnFocus = 'true' === option.split('=')[1] ? true : false;
  }
}
