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
}

/** Result of masking a value. */
export interface MaskResult {
  /** The value formatted with the mask. */
  readonly masked: string;
  /** Only the characters accepted by tokens (no literals), after any transform. */
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
  readonly complete: boolean;
}

/** Applies a mask to a value. */
export function applyMask(value: string, config: MaskConfig): MaskResult {
  return toResult(selectRun(value, config));
}

/**
 * Applies a mask to a value being edited and maps the caret from the edited value into the
 * masked one, so it stays next to the same user-typed character.
 *
 * @param deleteBackward true when the edit was a backward deletion (Backspace). It decides on
 * which side of adjacent literals the caret lands, so repeated deletions never get stuck.
 */
export function applyMaskWithCaret(
  value: string,
  caret: number,
  config: MaskConfig,
  deleteBackward = false,
): MaskEditResult {
  const run = selectRun(value, config);
  const boundedCaret = Math.max(0, Math.min(caret, value.length));
  const mappedCaret = config.reverse
    ? mapCaretFromEnd(run, boundedCaret, deleteBackward)
    : mapCaretFromStart(run, boundedCaret, deleteBackward);

  return { ...toResult(run), caret: mappedCaret };
}

function toResult(run: PatternRun): MaskResult {
  return {
    masked: run.cells.map((cell) => cell.char).join(''),
    raw: run.cells
      .filter((cell) => cell.token)
      .map((cell) => cell.char)
      .join(''),
    complete: run.complete,
  };
}

function selectRun(value: string, config: MaskConfig): PatternRun {
  const patterns = typeof config.pattern === 'string' ? [config.pattern] : config.pattern;

  if (patterns.length === 0) {
    throw new Error('[ng-mask] A mask needs at least one pattern.');
  }

  const translation = normalizeTranslation({ ...DEFAULT_TRANSLATION, ...config.translation });
  const isCandidate = candidateMatcher(patterns, translation);
  let best: PatternRun | undefined;

  for (const pattern of patterns) {
    const run = runPattern(value, pattern, translation, config.reverse ?? false, isCandidate);

    if (run.overflow === 0) {
      return run;
    }

    if (!best || run.acceptedBeforeOverflow > best.acceptedBeforeOverflow) {
      best = run;
    }
  }

  return best as PatternRun;
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
  const drop = (char: string) => {
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
      pending.push({ char: maskChar, token: false });
      v += char === maskChar ? step : 0;
      m += step;
      continue;
    }

    if (token.pattern.test(char)) {
      pending.splice(0).forEach(emit);
      emit({ char: token.transform ? token.transform(char) : char, token: true });
      accepted[v] = true;
      acceptedCount++;
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
