/**
 * Framework-agnostic mask engine. No Angular imports allowed here: the directive and the pipe are
 * thin wrappers around these functions, which keeps the masking rules unit-testable in isolation.
 *
 * Pattern syntax follows jQuery Mask Plugin: every character that has an entry in the translation
 * table is a token (a slot for user input); any other character is a literal.
 */

/** Describes how a token character of a pattern accepts user input. */
export interface MaskToken {
  /** Tested against a single input character. Do not rely on `g`/`y` flags; they are ignored. */
  readonly pattern: RegExp;
  /** The slot may be skipped when the input character does not match. */
  readonly optional?: boolean;
  /** The slot repeats (for example `#` in `#.##0,00`). */
  readonly recursive?: boolean;
  /** Converts an accepted character before it is written (for example to upper case). */
  readonly transform?: (char: string) => string;
}

/** Maps a pattern character to its token definition. */
export type MaskTranslation = Readonly<Record<string, MaskToken>>;

/** A complete mask definition. */
export interface MaskConfig {
  /**
   * The pattern, or a list of patterns. With a list, the first pattern that holds the whole input
   * wins, so masks can adapt as the user types (for example landline vs. mobile phone numbers).
   */
  readonly pattern: string | readonly string[];
  /** Fills the pattern from right to left, as in money masks. */
  readonly reverse?: boolean;
  /** Extra or overriding tokens, merged over {@link DEFAULT_TRANSLATION}. */
  readonly translation?: MaskTranslation;
  /**
   * Number of decimal places of a fixed-point number mask, such as money. With a scale:
   * - only digits are kept, extra leading zeros are removed and the value is padded to
   *   `scale + 1` digits, so `5` shows as `0,05` with `#.##0,00`;
   * - `raw` is a dot-decimal string with exactly `scale` decimals (`1234.56`);
   * - {@link formatValue} reads numbers and dot-decimal strings as amounts, rounded half up to
   *   `scale` decimals.
   *
   * An integer from 1 to 64. Use it with a reverse pattern. Negative values are not supported:
   * the sign is dropped. Values longer than a fixed-length pattern lose their leftmost digits,
   * typed or written from code.
   */
  readonly scale?: number;
}

/** Result of masking a value. */
export interface MaskResult {
  /** The value formatted with the mask. */
  readonly masked: string;
  /**
   * Only the characters accepted by tokens (no literals), after any transform. For masks with a
   * {@link MaskConfig.scale}, a dot-decimal string such as `1234.56`.
   */
  readonly raw: string;
  /** Whether every mandatory token of the selected pattern was filled. */
  readonly complete: boolean;
}

/** A {@link MaskResult} plus the caret position mapped into the masked value. */
export interface MaskEditResult extends MaskResult {
  readonly caret: number;
}

/** Default tokens, identical to jQuery Mask Plugin. */
export const DEFAULT_TRANSLATION: MaskTranslation = {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  A: { pattern: /[a-zA-Z0-9]/ },
  S: { pattern: /[a-zA-Z]/ },
};

interface Cell {
  readonly char: string;
  readonly token: boolean;
}

interface PatternRun {
  readonly cells: readonly Cell[];
  /** `accepted[i]` is true when the input character at index `i` filled a token. */
  readonly accepted: readonly boolean[];
  /** Input characters that could fill a token but were dropped (invalid position or no room). */
  readonly overflow: number;
  /** Characters accepted before the first dropped one: how far the pattern follows the input. */
  readonly acceptedBeforeOverflow: number;
  readonly acceptedCount: number;
  /** Input characters neither accepted by a token nor matched by a literal. */
  readonly dropped: number;
  readonly complete: boolean;
}

/**
 * How literals of the pattern treat an equal input character:
 * - `formatted`: consumed while the input is formatted at that point; once a literal of a run had
 *   to be inserted, the following ones are inserted too ("5" in "+55 (00)" is a digit);
 * - `consume`: always consumed ("5551…" keeps "55" as the country code);
 * - `insert`: never consumed ("2" in "2000-00" is a digit).
 */
type LiteralMode = 'formatted' | 'consume' | 'insert';

const DECIMAL_STRING = /^-?\d+(?:\.\d+)?$/;
const MAX_SCALE = 64;

/** Applies a mask to text, as typed or pasted by the user. */
export function applyMask(value: string, config: MaskConfig): MaskResult {
  assertValidScale(config);
  const input = prepareInput(value, value.length, config);

  return toResult(selectRun(input.value, config, false), config);
}

/**
 * Formats a value coming from code (a form model or a template) for display. Same as
 * {@link applyMask}, except that `null`/`undefined` become empty and, for masks with a
 * {@link MaskConfig.scale}, numbers and dot-decimal strings are read as numbers:
 * `1234.5` and `'1234.5'` show as `1.234,50` with `brMoeda`.
 */
export function formatValue(
  value: string | number | null | undefined,
  config: MaskConfig,
): MaskResult {
  assertValidScale(config);

  if (value === null || value === undefined) {
    return applyMask('', config);
  }

  const digits = config.scale === undefined ? null : numberToScaledDigits(value, config.scale);

  return digits === null
    ? applyMask(String(value), config)
    : toResult(selectRun(digits, config, false), config);
}

/**
 * Applies a mask to a value being edited and maps the caret from the edited value into the
 * masked one, so it stays next to the same user-typed character.
 *
 * @param deleteBackward true when the edit was a backward deletion (Backspace). It decides on
 * which side of adjacent literals the caret lands, so repeated deletions never get stuck.
 * @param isDeletion true when the edit removed text in any way (Backspace, Delete, cut, word
 * deletion, an IME commit that shortened the value). A deletion never turns a leftover leading
 * literal back into a typed character, so the field can be emptied.
 */
export function applyMaskWithCaret(
  value: string,
  caret: number,
  config: MaskConfig,
  deleteBackward = false,
  isDeletion = deleteBackward,
): MaskEditResult {
  assertValidScale(config);
  const input = prepareInput(value, Math.max(0, Math.min(caret, value.length)), config);
  const run = selectRun(input.value, config, isDeletion);
  const mappedCaret = config.reverse
    ? mapCaretFromEnd(run, input.caret, deleteBackward)
    : mapCaretFromStart(run, input.caret, deleteBackward);

  return { ...toResult(run, config), caret: mappedCaret };
}

/**
 * Fixed-point masks work on digits only. The caret keeps the same number of digits after it,
 * which is what reverse masks preserve, so it survives the zeros added or removed on the left.
 */
function prepareInput(
  value: string,
  caret: number,
  config: MaskConfig,
): { value: string; caret: number } {
  if (config.scale === undefined) {
    return { value, caret };
  }

  const digitsAfterCaret = onlyDigits(value.slice(caret)).length;
  const digits = scaledDigits(onlyDigits(value), config.scale, false);

  return { value: digits, caret: Math.max(0, digits.length - digitsAfterCaret) };
}

/**
 * Reads numbers and dot-decimal strings as an amount scaled to integer digits, exactly: the text
 * is split at the dot and the fraction padded or rounded half up (`'1234.565'` → `123457` with
 * scale 2). Numbers that `String()` writes in exponent notation (`1e21`) and non-finite numbers
 * give an empty field. Returns `null` for other strings, which are read as typed text.
 */
function numberToScaledDigits(value: string | number, scale: number): string | null {
  if (typeof value === 'number') {
    const text = String(value);

    return Number.isFinite(value) && !/e/i.test(text) ? decimalToScaledDigits(text, scale) : '';
  }

  const text = value.trim();

  return DECIMAL_STRING.test(text) ? decimalToScaledDigits(text, scale) : null;
}

function decimalToScaledDigits(text: string, scale: number): string {
  const [integer, fraction = ''] = text.replace('-', '').split('.');
  const kept = fraction.slice(0, scale).padEnd(scale, '0');
  const roundUp = Number(fraction[scale] ?? '0') >= 5;
  const digits = BigInt(`${integer}${kept}`) + (roundUp ? 1n : 0n);

  return scaledDigits(digits.toString(), scale, true);
}

function assertValidScale({ scale }: MaskConfig): void {
  if (scale !== undefined && !(Number.isInteger(scale) && scale >= 1 && scale <= MAX_SCALE)) {
    throw new Error(
      `[ng-mask] Invalid mask: scale must be an integer from 1 to ${MAX_SCALE}, got ${scale}.`,
    );
  }
}

/**
 * Removes extra leading zeros and pads to `scale + 1` digits (`5` → `005`). Typed zeros alone
 * clear the field, so deleting the last significant digit empties it; a zero number keeps `000`.
 */
function scaledDigits(digits: string, scale: number, keepZero: boolean): string {
  const significant = digits.replace(/^0+/, '');

  if (significant === '' && !keepZero) {
    return '';
  }

  return significant.padStart(scale + 1, '0');
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function toResult(run: PatternRun, config: MaskConfig): MaskResult {
  const raw = run.cells
    .filter((cell) => cell.token)
    .map((cell) => cell.char)
    .join('');

  return {
    masked: run.cells.map((cell) => cell.char).join(''),
    raw: config.scale === undefined ? raw : toDecimalString(raw, config.scale),
    complete: run.complete,
  };
}

/** `123456` with scale 2 → `1234.56`; `5` → `0.05`. */
function toDecimalString(digits: string, scale: number): string {
  if (digits === '') {
    return '';
  }

  const padded = digits.padStart(scale + 1, '0');
  const integer = padded.slice(0, padded.length - scale).replace(/^0+(?=\d)/, '');

  return `${integer}.${padded.slice(padded.length - scale)}`;
}

function selectRun(value: string, config: MaskConfig, isDeletion: boolean): PatternRun {
  const patterns = typeof config.pattern === 'string' ? [config.pattern] : config.pattern;

  if (patterns.length === 0) {
    throw new Error('[ng-mask] A mask needs at least one pattern.');
  }

  const translation = normalizeTranslation({ ...DEFAULT_TRANSLATION, ...config.translation });
  const isCandidate = candidateMatcher(patterns, translation);
  let best: PatternRun | undefined;

  for (const pattern of patterns) {
    const run = runPatternBestMode(
      (mode) => runPattern(value, pattern, translation, config.reverse ?? false, isCandidate, mode),
      isDeletion,
    );

    if (run.overflow === 0) {
      return run;
    }

    if (!best || run.acceptedBeforeOverflow > best.acceptedBeforeOverflow) {
      best = run;
    }
  }

  return best as PatternRun;
}

/**
 * Literals equal to input characters are ambiguous ("5" in "+55 (00) 00000-0000" may be the
 * country code or a digit). The `formatted` reading wins unless it overflows or drops input; then
 * the `consume` reading may do better (a pasted "5551999998888"). When nothing at all was accepted,
 * the user typed a character equal to a leading literal ("2" in "2000-00"), so the `insert`
 * reading is used if it is clean, except on deletions, which must be able to empty the field.
 */
function runPatternBestMode(
  run: (mode: LiteralMode) => PatternRun,
  isDeletion: boolean,
): PatternRun {
  let best = run('formatted');

  if (!isClean(best)) {
    const consume = run('consume');
    best = compareRuns(consume, best) > 0 ? consume : best;
  }

  if (best.acceptedCount === 0 && !isDeletion) {
    const insert = run('insert');
    best = isClean(insert) && insert.acceptedCount > 0 ? insert : best;
  }

  return best;
}

function isClean(run: PatternRun): boolean {
  return run.overflow === 0 && run.dropped === 0;
}

/** Positive when `a` is better: no overflow, then no dropped input, then more accepted. */
function compareRuns(a: PatternRun, b: PatternRun): number {
  return (
    Number(a.overflow === 0) - Number(b.overflow === 0) ||
    Number(a.dropped === 0) - Number(b.dropped === 0) ||
    a.acceptedCount - b.acceptedCount
  );
}

/** Matches characters that some token of the candidate patterns could accept. */
function candidateMatcher(
  patterns: readonly string[],
  translation: MaskTranslation,
): (char: string) => boolean {
  const tokens = [...new Set(patterns.join(''))]
    .map((char) => translation[char])
    .filter((token): token is MaskToken => token !== undefined);

  return (char) => tokens.some((token) => token.pattern.test(char));
}

function normalizeTranslation(translation: Record<string, MaskToken>): MaskTranslation {
  const normalized: Record<string, MaskToken> = {};

  for (const [char, token] of Object.entries(translation)) {
    const { pattern } = token;
    const stateless =
      pattern.global || pattern.sticky
        ? new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''))
        : pattern;
    normalized[char] = { ...token, pattern: stateless };
  }

  return normalized;
}

/**
 * Walks pattern and value together (right to left in reverse mode). Literals are emitted lazily,
 * only once a following token is filled, so the masked value never ends with a dangling literal
 * and deleting characters never fights against auto-inserted separators.
 */
function runPattern(
  value: string,
  pattern: string,
  translation: MaskTranslation,
  reverse: boolean,
  isCandidate: (char: string) => boolean,
  literalMode: LiteralMode,
): PatternRun {
  const step = reverse ? -1 : 1;
  const terminal = reverse ? 0 : pattern.length - 1;
  const restart = firstRecursiveIndex(pattern, translation, reverse);
  const cells: Cell[] = [];
  const pending: Cell[] = [];
  const accepted: boolean[] = new Array<boolean>(value.length).fill(false);
  const emit = (cell: Cell) => (reverse ? cells.unshift(cell) : cells.push(cell));
  const inPattern = (index: number) => index >= 0 && index < pattern.length;
  let acceptedCount = 0;
  let overflow = 0;
  let acceptedBeforeOverflow = 0;
  let dropped = 0;
  let literalsFromInput = true;
  const drop = (char: string) => {
    dropped++;
    if (isCandidate(char)) {
      acceptedBeforeOverflow = overflow === 0 ? acceptedCount : acceptedBeforeOverflow;
      overflow++;
    }
  };
  let m = reverse ? pattern.length - 1 : 0;
  let v = reverse ? value.length - 1 : 0;

  while (v >= 0 && v < value.length) {
    const char = value[v];

    if (!inPattern(m)) {
      drop(char);
      v += step;
      continue;
    }

    const maskChar = pattern[m];
    const token = translation[maskChar];

    if (!token) {
      const consumes: boolean =
        literalMode !== 'insert' &&
        char === maskChar &&
        (literalMode === 'consume' || literalsFromInput);
      literalsFromInput = consumes;
      pending.push({ char: maskChar, token: false });
      v += consumes ? step : 0;
      m += step;
      continue;
    }

    if (token.pattern.test(char)) {
      pending.splice(0).forEach(emit);
      emit({ char: token.transform ? token.transform(char) : char, token: true });
      accepted[v] = true;
      acceptedCount++;
      literalsFromInput = true;
      v += step;
      m = token.recursive && m === terminal && restart >= 0 ? restart : m + step;
      continue;
    }

    if (token.optional) {
      m += step;
      continue;
    }

    drop(char);
    v += step;
  }

  return {
    cells,
    accepted,
    overflow,
    acceptedBeforeOverflow: overflow === 0 ? acceptedCount : acceptedBeforeOverflow,
    acceptedCount,
    dropped,
    complete: !hasMandatoryToken(pattern, translation, m, step),
  };
}

/** The first recursive token met in traversal order, where repetition restarts (-1 if none). */
function firstRecursiveIndex(
  pattern: string,
  translation: MaskTranslation,
  reverse: boolean,
): number {
  const indices = [...pattern].map((_, index) => index);
  const ordered = reverse ? indices.reverse() : indices;

  return ordered.find((index) => translation[pattern[index]]?.recursive) ?? -1;
}

function hasMandatoryToken(
  pattern: string,
  translation: MaskTranslation,
  from: number,
  step: number,
): boolean {
  for (let m = from; m >= 0 && m < pattern.length; m += step) {
    const token = translation[pattern[m]];

    if (token && !token.optional && !token.recursive) {
      return true;
    }
  }

  return false;
}

/** Keeps the same number of accepted characters before the caret. */
function mapCaretFromStart(run: PatternRun, caret: number, deleteBackward: boolean): number {
  const tokensBefore = run.accepted.slice(0, caret).filter(Boolean).length;
  let position = 0;

  for (let seen = 0; seen < tokensBefore && position < run.cells.length; position++) {
    seen += run.cells[position].token ? 1 : 0;
  }

  if (!deleteBackward) {
    while (position < run.cells.length && !run.cells[position].token) {
      position++;
    }
  }

  return position;
}

/** Reverse masks grow to the left, so keep the same number of accepted characters after the caret. */
function mapCaretFromEnd(run: PatternRun, caret: number, deleteBackward: boolean): number {
  const tokensAfter = run.accepted.slice(caret).filter(Boolean).length;
  let position = run.cells.length;

  for (let seen = 0; seen < tokensAfter && position > 0; position--) {
    seen += run.cells[position - 1].token ? 1 : 0;
  }

  if (deleteBackward) {
    while (position > 0 && !run.cells[position - 1].token) {
      position--;
    }
  }

  return position;
}
