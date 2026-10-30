import { MaskConfig, MaskToken } from './mask-engine';

const toUpperCase = (char: string) => char.toUpperCase();

/** Letter or digit, written in upper case (alphanumeric CNPJ). */
const ALPHANUMERIC_UPPER: MaskToken = { pattern: /[0-9A-Za-z]/, transform: toUpperCase };

/** Letter, written in upper case (license plates). */
const LETTER_UPPER: MaskToken = { pattern: /[A-Za-z]/, transform: toUpperCase };

const CPF = '000.000.000-00';
/** Alphanumeric CNPJ (Receita Federal, from July 2026): 12 letters/digits + 2 numeric check digits. */
const CNPJ = 'XX.XXX.XXX/XXXX-00';
const CNPJ_TRANSLATION = { X: ALPHANUMERIC_UPPER };

/** Ready-to-use masks, referenced by name: `<input mask="brCpf">`. */
export const NG_MASK_PRESETS = {
  brCpf: { pattern: CPF },
  brCnpj: { pattern: CNPJ, translation: CNPJ_TRANSLATION },
  brCpfCnpj: { pattern: [CPF, CNPJ], translation: CNPJ_TRANSLATION },
  brTelefone: { pattern: ['(00) 0000-0000', '(00) 00000-0000'] },
  brCelular: { pattern: '(00) 00000-0000' },
  brCep: { pattern: '00000-000' },
  brData: { pattern: '00/00/0000' },
  brHora: { pattern: '00:00' },
  brDataHora: { pattern: '00/00/0000 00:00' },
  brMoeda: { pattern: '#.##0,00', reverse: true, scale: 2 },
  brPlaca: { pattern: ['LLL-0000', 'LLL0L00'], translation: { L: LETTER_UPPER } },
  usPhone: { pattern: '(000) 000-0000' },
  coordinateLat: {
    pattern: "000º00.0000'~",
    translation: { '~': { pattern: /[NS]/i, transform: toUpperCase } },
  },
  coordinateLong: {
    pattern: "000º00.0000'~",
    translation: { '~': { pattern: /[EW]/i, transform: toUpperCase } },
  },
  date: { pattern: '00/00/0000' },
  dateTime: { pattern: '00/00/0000 00:00:00' },
  time: { pattern: '00:00:00' },
} as const satisfies Record<string, MaskConfig>;

/** Name of a built-in mask. */
export type MaskPresetName = keyof typeof NG_MASK_PRESETS;

/**
 * What the directive and the pipe accept: a preset name, a pattern, `integer(p)` / `decimal(p,s)`
 * (kept from 2.x), or a full {@link MaskConfig}. Empty values disable masking.
 */
export type MaskInput = MaskPresetName | string | MaskConfig | null | undefined;

const NUMERIC_MASK = /^(?:integer\((\d+)\)|decimal\((\d+),(\d+)\))$/;
const MAX_PRECISION = 64;

/** Turns a {@link MaskInput} into a {@link MaskConfig}, or `null` when masking is disabled. */
export function resolveMask(mask: MaskInput): MaskConfig | null {
  if (mask === null || mask === undefined || mask === '') {
    return null;
  }

  if (typeof mask !== 'string') {
    return mask;
  }

  if (Object.hasOwn(NG_MASK_PRESETS, mask)) {
    return NG_MASK_PRESETS[mask as MaskPresetName];
  }

  return parseNumericMask(mask) ?? { pattern: mask };
}

/**
 * `integer(6)` → `000000`; `decimal(5,2)` → reverse `000.00` with scale 2, as in 2.x.
 *
 * @throws Error when the precision is not 1–64 or the scale is not between 1 and precision − 1.
 */
function parseNumericMask(mask: string): MaskConfig | null {
  const match = NUMERIC_MASK.exec(mask);

  if (!match) {
    return null;
  }

  const [, integerPrecision, decimalPrecision, decimalScale] = match;
  const precision = Number(integerPrecision ?? decimalPrecision);

  if (precision < 1 || precision > MAX_PRECISION) {
    throw new Error(`[ng-mask] Invalid mask "${mask}": precision must be 1 to ${MAX_PRECISION}.`);
  }

  if (decimalScale === undefined) {
    return { pattern: '0'.repeat(precision) };
  }

  const scale = Number(decimalScale);

  if (scale < 1 || scale >= precision) {
    throw new Error(`[ng-mask] Invalid mask "${mask}": scale must be 1 to precision - 1.`);
  }

  return {
    pattern: `${'0'.repeat(precision - scale)}.${'0'.repeat(scale)}`,
    reverse: true,
    scale,
  };
}
