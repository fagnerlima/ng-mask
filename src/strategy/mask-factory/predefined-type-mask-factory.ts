import { MaskFactory } from './mask-factory';
import { Mask } from '../../mask';

const predefinedMasks: { [type: string]: Mask } = {
  'br-cep': new Mask('00000-000'),
  'br-data': new Mask('00/00/0000'),
  'br-cnpj': new Mask('00.000.000/0000-00'),
  'br-cpf': new Mask('000.000.000-00'),
  'br-celular': new Mask('(00) 90000-0000'),
  'coordinate-lat': new Mask('000º00.0000\'~', { translation: { '~': { pattern: /[N|S]/ } } }),
  'coordinate-long': new Mask('000º00.0000\'~', { translation: { '~': { pattern: /[N|S]/ } } })
};

export class PredefinedTypeMaskFactory extends MaskFactory {

  public static getTypes(): string[] {

    return Object.keys(predefinedMasks);
  }

  public create(): Mask {
    if (PredefinedTypeMaskFactory.getTypes().indexOf(this.mask) < 0) {

      return null;
    }

    return predefinedMasks[this.mask];
  }
}