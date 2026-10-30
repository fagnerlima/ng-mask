/**
 * Check-digit validation for Brazilian documents. Framework-agnostic.
 *
 * Formatting characters (`.`, `/`, `-` and spaces) are ignored, so both masked and raw values are
 * accepted. Letters must be upper case, as issued by Receita Federal.
 */

const FORMATTING = /[.\-/\s]/g;
const CPF_FORMAT = /^\d{11}$/;
/** 12 alphanumeric characters (letters from July 2026) followed by 2 numeric check digits. */
const CNPJ_FORMAT = /^[0-9A-Z]{12}\d{2}$/;
const ALL_SAME_CHARACTER = /^(.)\1*$/;

const CPF_FIRST_WEIGHTS = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const CPF_SECOND_WEIGHTS = [11, ...CPF_FIRST_WEIGHTS];
const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, ...CNPJ_FIRST_WEIGHTS];

/** Removes the formatting characters a mask adds to CPF/CNPJ values. */
export function stripDocumentFormatting(value: string): string {
  return value.replace(FORMATTING, '');
}

/** Whether `value` is a CPF with valid check digits (masked or not). */
export function isValidCpf(value: string): boolean {
  const cpf = stripDocumentFormatting(value);

  if (!CPF_FORMAT.test(cpf) || ALL_SAME_CHARACTER.test(cpf)) {
    return false;
  }

  return hasCheckDigits(cpf, CPF_FIRST_WEIGHTS, CPF_SECOND_WEIGHTS, cpfCheckDigit);
}

/** Whether `value` is a numeric or alphanumeric CNPJ with valid check digits (masked or not). */
export function isValidCnpj(value: string): boolean {
  const cnpj = stripDocumentFormatting(value);

  if (!CNPJ_FORMAT.test(cnpj) || ALL_SAME_CHARACTER.test(cnpj)) {
    return false;
  }

  return hasCheckDigits(cnpj, CNPJ_FIRST_WEIGHTS, CNPJ_SECOND_WEIGHTS, cnpjCheckDigit);
}

function hasCheckDigits(
  document: string,
  firstWeights: readonly number[],
  secondWeights: readonly number[],
  checkDigit: (sum: number) => number,
): boolean {
  const base = document.slice(0, firstWeights.length);
  const first = checkDigit(weightedSum(base, firstWeights));
  const second = checkDigit(weightedSum(`${base}${first}`, secondWeights));

  return document.endsWith(`${first}${second}`);
}

/**
 * Each character is worth its ASCII code minus 48: digits keep their value and letters map to
 * A=17 … Z=42, the rule Receita Federal defined for the alphanumeric CNPJ.
 */
function weightedSum(characters: string, weights: readonly number[]): number {
  return weights.reduce(
    (sum, weight, index) => sum + (characters.charCodeAt(index) - 48) * weight,
    0,
  );
}

function cpfCheckDigit(sum: number): number {
  const remainder = (sum * 10) % 11;

  return remainder === 10 ? 0 : remainder;
}

function cnpjCheckDigit(sum: number): number {
  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}
