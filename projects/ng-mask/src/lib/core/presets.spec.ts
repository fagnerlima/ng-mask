import { applyMask } from './mask-engine';
import { MaskInput, MaskPresetName, NG_MASK_PRESETS, resolveMask } from './presets';

function mask(value: string, input: MaskInput) {
  const config = resolveMask(input);

  if (!config) {
    throw new Error(`No mask for ${String(input)}`);
  }

  return applyMask(value, config);
}

describe('presets', () => {
  // [preset, raw input, complete masked value, partial input, partial masked value]
  const cases: [MaskPresetName, string, string, string, string][] = [
    ['brCpf', '12345678909', '123.456.789-09', '1234', '123.4'],
    ['brCnpj', '11222333000181', '11.222.333/0001-81', '112223', '11.222.3'],
    ['brCnpj', '12ABC34501DE35', '12.ABC.345/01DE-35', '12AB', '12.AB'],
    ['brCpfCnpj', '12345678909', '123.456.789-09', '123', '123'],
    ['brCpfCnpj', '11222333000181', '11.222.333/0001-81', '112223330001', '11.222.333/0001'],
    ['brTelefone', '1134567890', '(11) 3456-7890', '113', '(11) 3'],
    ['brTelefone', '11934567890', '(11) 93456-7890', '1193456', '(11) 9345-6'],
    ['brCelular', '11934567890', '(11) 93456-7890', '119', '(11) 9'],
    ['brCep', '01310930', '01310-930', '013109', '01310-9'],
    ['brData', '31122026', '31/12/2026', '311', '31/1'],
    ['brHora', '2359', '23:59', '235', '23:5'],
    ['brDataHora', '311220262359', '31/12/2026 23:59', '311220262', '31/12/2026 2'],
    ['brMoeda', '123456', '1.234,56', '1', '1'],
    ['brPlaca', 'ABC1234', 'ABC-1234', 'ABC1', 'ABC-1'],
    ['brPlaca', 'BRA2E19', 'BRA2E19', 'BRA2E', 'BRA2E'],
    ['usPhone', '5815555895', '(581) 555-5895', '5815', '(581) 5'],
    ['coordinateLat', '123547894N', "123º54.7894'N", '1235', '123º5'],
    ['coordinateLong', '354796452E', "354º79.6452'E", '354796', '354º79.6'],
    ['date', '01312017', '01/31/2017', '0131', '01/31'],
    ['dateTime', '05182017083000', '05/18/2017 08:30:00', '051820170', '05/18/2017 0'],
    ['time', '191500', '19:15:00', '1915', '19:15'],
  ];

  it.each(cases)('%s formats a complete value %s as %s', (preset, raw, expected) => {
    expect(mask(raw, preset)).toMatchObject({ masked: expected, complete: true });
  });

  it.each(cases)('%s formats a partial value', (preset, _raw, _complete, partial, expected) => {
    expect(mask(partial, preset).masked).toBe(expected);
  });

  // Reverse masks grow and pattern lists switch to a longer pattern instead of overflowing.
  const fixedLength = cases.filter(
    ([preset]) => !['brMoeda', 'brTelefone', 'brCpfCnpj'].includes(preset),
  );

  it.each(fixedLength)('%s drops overflowing characters of %s', (preset, raw, expected) => {
    expect(mask(`${raw}9`, preset).masked).toBe(expected);
  });

  it('covers every preset in the table above', () => {
    const tested = new Set(cases.map(([preset]) => preset));

    expect([...tested].sort()).toEqual(Object.keys(NG_MASK_PRESETS).sort());
  });

  describe('invalid characters', () => {
    it.each([
      ['brCpf', '12a3.4b5', '123.45'],
      ['brCep', '01x310-930', '01310-930'],
      ['brTelefone', '(11) abc3456-7890', '(11) 3456-7890'],
      ['brMoeda', 'R$ 1.234,56', '1.234,56'],
      ['brData', '31-12-2026', '31/12/2026'],
    ])('%s ignores invalid characters in %s', (preset, value, expected) => {
      expect(mask(value, preset).masked).toBe(expected);
    });

    it('rejects letters in the CNPJ check digits', () => {
      expect(mask('12ABC34501DEAB', 'brCnpj').masked).toBe('12.ABC.345/01DE');
    });

    it('rejects digits where the license plate expects letters', () => {
      expect(mask('1AB', 'brPlaca').masked).toBe('AB');
    });

    it('rejects symbols in the alphanumeric CNPJ', () => {
      expect(mask('12$ABC', 'brCnpj').masked).toBe('12.ABC');
    });
  });

  describe('upper case', () => {
    it('upper-cases the alphanumeric CNPJ', () => {
      expect(mask('12abc34501de35', 'brCnpj')).toEqual({
        masked: '12.ABC.345/01DE-35',
        raw: '12ABC34501DE35',
        complete: true,
      });
    });

    it('upper-cases license plates', () => {
      expect(mask('abc1234', 'brPlaca').masked).toBe('ABC-1234');
      expect(mask('bra2e19', 'brPlaca').masked).toBe('BRA2E19');
    });

    it('upper-cases coordinate hemispheres', () => {
      expect(mask('123547894s', 'coordinateLat').masked).toBe("123º54.7894'S");
      expect(mask('354796452w', 'coordinateLong').masked).toBe("354º79.6452'W");
    });

    it('rejects the wrong hemisphere', () => {
      expect(mask('123547894E', 'coordinateLat').complete).toBe(false);
    });
  });

  describe('dynamic switching', () => {
    it('brTelefone switches between landline and mobile as digits are typed or deleted', () => {
      expect(mask('(11) 3456-78901', 'brTelefone').masked).toBe('(11) 34567-8901');
      expect(mask('(11) 34567-890', 'brTelefone').masked).toBe('(11) 3456-7890');
    });

    it('brTelefone is incomplete until the landline number is filled', () => {
      expect(mask('113456789', 'brTelefone').complete).toBe(false);
    });

    it('brCpfCnpj switches to CNPJ after the eleventh digit', () => {
      expect(mask('123.456.789-091', 'brCpfCnpj').masked).toBe('12.345.678/9091');
    });

    it('brCpfCnpj switches to CNPJ as soon as a letter is typed', () => {
      expect(mask('12A', 'brCpfCnpj').masked).toBe('12.A');
    });

    it('brCpfCnpj switches back to CPF when digits are deleted', () => {
      expect(mask('12.345.678/909', 'brCpfCnpj').masked).toBe('123.456.789-09');
    });

    it('brPlaca switches from the old format to Mercosul on a letter in the fifth position', () => {
      expect(mask('ABC-1E', 'brPlaca').masked).toBe('ABC1E');
      expect(mask('ABC1E2', 'brPlaca').masked).toBe('ABC1E2');
    });

    it('brPlaca keeps the Mercosul format when the user types past the end', () => {
      expect(mask('BRA2E199', 'brPlaca').masked).toBe('BRA2E19');
    });

    it('brPlaca switches back to the old format when the letter is replaced by a digit', () => {
      expect(mask('ABC12', 'brPlaca').masked).toBe('ABC-12');
    });
  });

  describe('brMoeda', () => {
    it('grows thousand separators to the left', () => {
      expect(mask('123456789012', 'brMoeda').masked).toBe('1.234.567.890,12');
    });

    it('extracts the raw digits', () => {
      expect(mask('1.234,56', 'brMoeda').raw).toBe('123456');
    });
  });
});

describe('resolveMask', () => {
  it.each([null, undefined, ''])('disables masking for %s', (input) => {
    expect(resolveMask(input)).toBeNull();
  });

  it('resolves preset names', () => {
    expect(resolveMask('brCpf')).toBe(NG_MASK_PRESETS.brCpf);
  });

  it('treats any other string as a pattern', () => {
    expect(resolveMask('00-00')).toEqual({ pattern: '00-00' });
  });

  it('does not resolve inherited object keys as presets', () => {
    expect(resolveMask('toString')).toEqual({ pattern: 'toString' });
  });

  it('returns configuration objects unchanged', () => {
    const config = { pattern: '0', reverse: true };

    expect(resolveMask(config)).toBe(config);
  });

  it('keeps the 2.x integer(p) mask', () => {
    expect(resolveMask('integer(6)')).toEqual({ pattern: '000000' });
  });

  it('keeps the 2.x decimal(p,s) mask', () => {
    const config = resolveMask('decimal(10,2)');

    expect(config).toEqual({ pattern: '00000000.00', reverse: true });
    expect(applyMask('12345', config!).masked).toBe('123.45');
  });

  it('does not produce a negative integer part for decimal masks', () => {
    expect(resolveMask('decimal(2,4)')).toEqual({ pattern: '.0000', reverse: true });
  });
});
