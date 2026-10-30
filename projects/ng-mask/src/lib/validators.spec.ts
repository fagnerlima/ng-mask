import { FormControl } from '@angular/forms';

import { cnpjValidator, cpfCnpjValidator, cpfValidator } from './validators';

describe('document validators', () => {
  describe('cpfValidator', () => {
    it.each(['529.982.247-25', '52998224725'])('accepts %s', (value) => {
      expect(cpfValidator(new FormControl(value))).toBeNull();
    });

    it.each(['529.982.247-26', '111.111.111-11', '123'])('rejects %s', (value) => {
      expect(cpfValidator(new FormControl(value))).toEqual({ cpf: true });
    });
  });

  describe('cnpjValidator', () => {
    it.each(['11.222.333/0001-81', '12.ABC.345/01DE-35'])('accepts %s', (value) => {
      expect(cnpjValidator(new FormControl(value))).toBeNull();
    });

    it.each(['11.222.333/0001-82', '00.000.000/0000-00', '12.ABC.345/01DE-36'])(
      'rejects %s',
      (value) => {
        expect(cnpjValidator(new FormControl(value))).toEqual({ cnpj: true });
      },
    );
  });

  describe('cpfCnpjValidator', () => {
    it.each(['529.982.247-25', '11.222.333/0001-81', '12ABC34501DE35'])('accepts %s', (value) => {
      expect(cpfCnpjValidator(new FormControl(value))).toBeNull();
    });

    it.each(['529.982.247-26', '11.222.333/0001-82', '1234'])('rejects %s', (value) => {
      expect(cpfCnpjValidator(new FormControl(value))).toEqual({ cpfCnpj: true });
    });
  });

  it.each([null, undefined, ''])('leaves empty values (%s) to Validators.required', (value) => {
    const control = new FormControl(value);

    expect(cpfValidator(control)).toBeNull();
    expect(cnpjValidator(control)).toBeNull();
    expect(cpfCnpjValidator(control)).toBeNull();
  });

  it('validates numeric control values as text', () => {
    expect(cpfValidator(new FormControl(52998224725))).toBeNull();
  });
});
