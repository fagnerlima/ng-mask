import { isValidCnpj, isValidCpf, stripDocumentFormatting } from './br-documents';

describe('isValidCpf', () => {
  it.each(['529.982.247-25', '52998224725', '123.456.789-09', '000.000.001-91'])(
    'accepts %s',
    (cpf) => {
      expect(isValidCpf(cpf)).toBe(true);
    },
  );

  it.each([
    ['wrong first check digit', '529.982.247-35'],
    ['wrong second check digit', '529.982.247-26'],
    ['too short', '5299822472'],
    ['too long', '529982247251'],
    ['letters', '52998224A25'],
    ['empty', ''],
    ['unexpected symbols', '529*982*247*25'],
  ])('rejects a CPF with %s', (_reason, cpf) => {
    expect(isValidCpf(cpf)).toBe(false);
  });

  it.each(Array.from({ length: 10 }, (_, digit) => String(digit).repeat(11)))(
    'rejects the repeated-digit CPF %s',
    (cpf) => {
      expect(isValidCpf(cpf)).toBe(false);
    },
  );
});

describe('isValidCnpj', () => {
  it.each([
    ['numeric, masked', '11.222.333/0001-81'],
    ['numeric, raw', '11222333000181'],
    ['alphanumeric, official example', '12.ABC.345/01DE-35'],
    ['alphanumeric, raw', '12ABC34501DE35'],
  ])('accepts a %s CNPJ', (_kind, cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(true);
  });

  it.each([
    ['wrong numeric check digits', '11.222.333/0001-82'],
    ['wrong alphanumeric check digits', '12.ABC.345/01DE-36'],
    ['letters in the check digits', '12.ABC.345/01DE-3A'],
    ['lower-case letters', '12.abc.345/01de-35'],
    ['too short', '1122233300018'],
    ['too long', '112223330001811'],
    ['symbols', '11#222333000181'],
    ['empty', ''],
  ])('rejects a CNPJ with %s', (_reason, cnpj) => {
    expect(isValidCnpj(cnpj)).toBe(false);
  });

  it.each(['00000000000000', '11111111111111', '99999999999999'])(
    'rejects the repeated-digit CNPJ %s',
    (cnpj) => {
      expect(isValidCnpj(cnpj)).toBe(false);
    },
  );
});

describe('stripDocumentFormatting', () => {
  it('removes dots, slashes, dashes and spaces only', () => {
    expect(stripDocumentFormatting(' 12.ABC.345/01DE-35 ')).toBe('12ABC34501DE35');
    expect(stripDocumentFormatting('(11)')).toBe('(11)');
  });
});
