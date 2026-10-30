import { MaskConfig, applyMask, applyMaskWithCaret, formatValue } from './mask-engine';

const masked = (value: string, config: MaskConfig) => applyMask(value, config).masked;

describe('applyMask', () => {
  describe('default tokens', () => {
    const date: MaskConfig = { pattern: '00/00/0000' };

    it('formats a complete value and reports it as complete', () => {
      expect(applyMask('31122026', date)).toEqual({
        masked: '31/12/2026',
        raw: '31122026',
        complete: true,
      });
    });

    it('formats a partial value without a dangling literal', () => {
      expect(applyMask('3112', date)).toEqual({ masked: '31/12', raw: '3112', complete: false });
    });

    it('drops characters beyond the pattern length', () => {
      expect(masked('3112202699', date)).toBe('31/12/2026');
    });

    it('drops characters that do not match the token', () => {
      expect(masked('3a1-1b2', date)).toBe('31/12');
    });

    it('accepts values that already contain the literals', () => {
      expect(masked('31/12/2026', date)).toBe('31/12/2026');
    });

    it('returns an empty, incomplete result for an empty value', () => {
      expect(applyMask('', date)).toEqual({ masked: '', raw: '', complete: false });
    });

    it('emits leading literals with the first accepted character', () => {
      expect(masked('1', { pattern: '(000)' })).toBe('(1');
    });

    it('treats 9 as an optional digit', () => {
      const config: MaskConfig = { pattern: '(00) 00009-0000' };

      expect(masked('11987654321', config)).toBe('(11) 98765-4321');
      expect(applyMask('1198765432', config)).toMatchObject({
        masked: '(11) 98765-432',
        complete: false,
      });
    });

    it('skips an optional token whose character does not match', () => {
      expect(applyMask('1a', { pattern: '09a', translation: { a: { pattern: /[a-z]/ } } })).toEqual(
        {
          masked: '1a',
          raw: '1a',
          complete: true,
        },
      );
    });

    it('accepts letters and digits with A and only letters with S', () => {
      expect(masked('a1b2', { pattern: 'AAAA' })).toBe('a1b2');
      expect(masked('a1b2', { pattern: 'SSSS' })).toBe('ab');
    });

    it('repeats a recursive token', () => {
      expect(masked('1234567890', { pattern: '#' })).toBe('1234567890');
      expect(applyMask('', { pattern: '#' }).complete).toBe(true);
    });
  });

  describe('literals that look like input', () => {
    const brazil: MaskConfig = { pattern: '+55 (00) 00000-0000' };

    it.each([
      ['5', '+55 (5'],
      ['55', '+55 (55'],
      ['551', '+55 (55) 1'],
      ['+55 (51) 9', '+55 (51) 9'],
      ['+55 (51) 98765-4321', '+55 (51) 98765-4321'],
      ['5198765432', '+55 (51) 98765-432'],
    ])('treats %s typed in +55 (00) 00000-0000 as %s', (value, expected) => {
      expect(masked(value, brazil)).toBe(expected);
    });

    it('treats a digit equal to an inserted literal as input (+1 (000) 000-0000)', () => {
      expect(masked('1', { pattern: '+1 (000) 000-0000' })).toBe('+1 (1');
      expect(masked('+1 (1', { pattern: '+1 (000) 000-0000' })).toBe('+1 (1');
    });

    it('keeps a leading literal that the input already starts with (2000-00)', () => {
      const config: MaskConfig = { pattern: '2000-00' };

      expect(masked('3', config)).toBe('23');
      expect(masked('223', config)).toBe('223');
      expect(masked('2234', config)).toBe('2234');
      expect(masked('22345', config)).toBe('2234-5');
      // Ambiguous by design: a lone "2" is read as the literal, so that deleting the last digit
      // of "22" empties the field instead of being undone by the mask.
      expect(masked('2', config)).toBe('');
    });
  });

  describe('fixed-point masks (scale)', () => {
    const money: MaskConfig = { pattern: '#.##0,00', reverse: true, scale: 2 };

    it.each([
      ['5', '0,05', '0.05'],
      ['50', '0,50', '0.50'],
      ['500', '5,00', '5.00'],
      ['0001', '0,01', '0.01'],
      ['123456', '1.234,56', '1234.56'],
      ['1.234,567', '12.345,67', '12345.67'],
      ['R$ 1.234,56', '1.234,56', '1234.56'],
    ])('formats %s as %s with raw %s', (value, expected, raw) => {
      expect(applyMask(value, money)).toEqual({ masked: expected, raw, complete: true });
    });

    it.each(['', '0', '000', '0,00', 'abc'])('empties the field for %j', (value) => {
      expect(applyMask(value, money)).toEqual({ masked: '', raw: '', complete: false });
    });

    it('keeps the caret before the same digits when zeros are added on the left', () => {
      // "0,0|5" + "1" → "0,015" → "0,15", caret before the 5
      expect(applyMaskWithCaret('0,015', 4, money)).toMatchObject({ masked: '0,15', caret: 3 });
    });

    it('empties the field when the last significant digit is deleted', () => {
      expect(applyMaskWithCaret('0,0', 3, money, true)).toMatchObject({ masked: '', caret: 0 });
    });

    it('supports a scale of zero', () => {
      expect(applyMask('0012', { pattern: '#.##0', reverse: true, scale: 0 })).toMatchObject({
        masked: '12',
        raw: '12',
      });
    });
  });

  describe('reverse masks', () => {
    const money: MaskConfig = { pattern: '#.##0,00', reverse: true };

    it.each([
      ['5', '5'],
      ['56', '56'],
      ['456', '4,56'],
      ['123456', '1.234,56'],
      ['12345678', '123.456,78'],
      ['123456789', '1.234.567,89'],
      ['1234567890123', '12.345.678.901,23'],
    ])('formats %s as %s', (value, expected) => {
      expect(masked(value, money)).toBe(expected);
    });

    it('reformats a value whose separators moved after typing', () => {
      expect(masked('1.234,567', money)).toBe('12.345,67');
    });

    it('extracts the raw digits', () => {
      expect(applyMask('1.234,56', money).raw).toBe('123456');
    });

    it('reports completeness once the fixed part is filled', () => {
      expect(applyMask('56', money).complete).toBe(false);
      expect(applyMask('456', money).complete).toBe(true);
      expect(applyMask('123456789', money).complete).toBe(true);
    });
  });

  describe('custom translation', () => {
    it('uses custom tokens and transforms accepted characters', () => {
      const config: MaskConfig = {
        pattern: 'UU-00',
        translation: { U: { pattern: /[a-z]/i, transform: (char) => char.toUpperCase() } },
      };

      expect(applyMask('ab12', config)).toEqual({ masked: 'AB-12', raw: 'AB12', complete: true });
    });

    it('can override a default token', () => {
      expect(masked('1a2', { pattern: '000', translation: { '0': { pattern: /[a-z]/ } } })).toBe(
        'a',
      );
    });

    it('ignores global and sticky regular expression flags', () => {
      const config: MaskConfig = { pattern: '0000', translation: { '0': { pattern: /\d/gy } } };

      expect(masked('1234', config)).toBe('1234');
    });
  });

  describe('pattern lists', () => {
    const phone: MaskConfig = { pattern: ['(00) 0000-0000', '(00) 00000-0000'] };

    it('uses the first pattern that holds the whole value', () => {
      expect(masked('1134567890', phone)).toBe('(11) 3456-7890');
      expect(masked('11934567890', phone)).toBe('(11) 93456-7890');
    });

    it('ignores literals left over from the other pattern', () => {
      expect(masked('(11) 93456-789', phone)).toBe('(11) 9345-6789');
    });

    it('falls back to the pattern that follows the input the furthest', () => {
      expect(masked('119345678901', phone)).toBe('(11) 93456-7890');
    });

    it('prefers the pattern whose first rejected character comes last', () => {
      // Both patterns accept 4 characters; only the second one keeps the leading letters.
      const config: MaskConfig = { pattern: ['0000', 'SS00'] };

      expect(masked('AB123', config)).toBe('AB12');
    });

    it('rejects an empty pattern list', () => {
      expect(() => applyMask('1', { pattern: [] })).toThrowError(/at least one pattern/);
    });
  });
});

describe('formatValue', () => {
  const money: MaskConfig = { pattern: '#.##0,00', reverse: true, scale: 2 };

  it.each([
    [1234.5, '1.234,50', '1234.50'],
    ['1234.5', '1.234,50', '1234.50'],
    [10, '10,00', '10.00'],
    ['10', '10,00', '10.00'],
    [0.05, '0,05', '0.05'],
    [0, '0,00', '0.00'],
    [1234.567, '1.234,57', '1234.57'],
  ])('formats the number %j as %s with raw %s', (value, expected, raw) => {
    expect(formatValue(value, money)).toMatchObject({ masked: expected, raw });
  });

  it('reads already formatted text as typed text', () => {
    expect(formatValue('1.234,56', money).masked).toBe('1.234,56');
  });

  it('drops the sign of negative numbers (not supported)', () => {
    expect(formatValue(-5, money).masked).toBe('5,00');
  });

  it.each([null, undefined])('formats %s as empty', (value) => {
    expect(formatValue(value, money).masked).toBe('');
  });

  it('formats numbers as text for masks without a scale', () => {
    expect(formatValue(12345678909, { pattern: '000.000.000-00' }).masked).toBe('123.456.789-09');
  });
});

describe('applyMaskWithCaret', () => {
  const cpf: MaskConfig = { pattern: '000.000.000-00' };
  const money: MaskConfig = { pattern: '#.##0,00', reverse: true };

  it('keeps the caret at the end while typing at the end', () => {
    expect(applyMaskWithCaret('1234', 4, cpf)).toMatchObject({ masked: '123.4', caret: 5 });
  });

  it('places the caret after the leading literal on the first character', () => {
    expect(applyMaskWithCaret('1', 1, { pattern: '(00)' })).toMatchObject({ caret: 2 });
  });

  it('keeps the caret after the inserted character when typing in the middle', () => {
    // "123.4|56" + "9" → "123.495.6", caret after the 9
    expect(applyMaskWithCaret('123.4956', 6, cpf)).toMatchObject({
      masked: '123.495.6',
      caret: 6,
    });
  });

  it('jumps over a literal that follows an inserted character', () => {
    // "12|3.456" + "9" → "129|3.456" → "129.345.6", caret after the new separator
    expect(applyMaskWithCaret('1293.456', 3, cpf)).toMatchObject({
      masked: '129.345.6',
      caret: 4,
    });
  });

  it('moves the caret before a literal deleted with Backspace', () => {
    // "123.|456" Backspace removes "." → caret lands before the restored separator
    expect(applyMaskWithCaret('123456', 3, cpf, true)).toMatchObject({
      masked: '123.456',
      caret: 3,
    });
  });

  it('keeps the caret in place when deleting a character in the middle', () => {
    // "123.45|6" Backspace removes "5"
    expect(applyMaskWithCaret('123.46', 5, cpf, true)).toMatchObject({
      masked: '123.46',
      caret: 5,
    });
  });

  it('moves the caret past a literal deleted with Delete', () => {
    // "123|.456" Delete removes "." → caret jumps after the restored separator
    expect(applyMaskWithCaret('123456', 3, cpf)).toMatchObject({ masked: '123.456', caret: 4 });
  });

  it('clamps a caret outside the value', () => {
    expect(applyMaskWithCaret('12', 99, cpf).caret).toBe(2);
    expect(applyMaskWithCaret('12', -5, cpf, true).caret).toBe(0);
  });

  describe('reverse masks', () => {
    it('keeps the caret at the end while typing at the end', () => {
      expect(applyMaskWithCaret('1.234,567', 9, money)).toMatchObject({
        masked: '12.345,67',
        caret: 9,
      });
    });

    it('keeps the characters after the caret when typing in the middle', () => {
      // "1.2|34,56" + "9" → "12.9|34,56"
      expect(applyMaskWithCaret('1.2934,56', 4, money)).toMatchObject({
        masked: '12.934,56',
        caret: 4,
      });
    });

    it('moves the caret before a literal deleted with Backspace', () => {
      // "1.234,|56" Backspace removes "," → caret lands before the restored separator
      expect(applyMaskWithCaret('1.23456', 5, money, true)).toMatchObject({
        masked: '1.234,56',
        caret: 5,
      });
    });

    it('keeps the caret before the same characters after deleting in the middle', () => {
      // "1.23|4,56" Backspace removes "3" → "12|4,56"
      expect(applyMaskWithCaret('1.24,56', 3, money, true)).toMatchObject({
        masked: '124,56',
        caret: 2,
      });
    });
  });
});
