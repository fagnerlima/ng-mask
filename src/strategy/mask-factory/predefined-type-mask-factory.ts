import { MaskFactory } from './mask-factory';
import { Mask } from '../../mask';

const predefinedMasks: { [type: string]: Mask } = {
  'brCelular': new Mask('(00) 90000-0000'),
  'brCep': new Mask('00000-000'),
  'brCnpj': new Mask('00.000.000/0000-00'),
  'brCpf': new Mask('000.000.000-00'),
  'brData': new Mask('00/00/0000'),
  'brMoeda': new Mask('#.##0,00', { reverse: true }),
  'brTelefone': new Mask('(00) 90000-0000'),
  'usPhone': new Mask('(000) 000-0000'),
  'coordinateLat': new Mask('000º00.0000\'~', { translation: { '~': { pattern: /[N|S]/ } } }),
  'coordinateLong': new Mask('000º00.0000\'~', { translation: { '~': { pattern: /[N|S]/ } } }),
  'date': new Mask('00/00/0000'),
  'dateTime': new Mask('00/00/0000 00:00:00'),
  'time': new Mask('00:00:00')
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
