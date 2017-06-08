/**
 * Translation Option for NgMask.
 */
export interface TranslationMask {

  /**
   * Joker in the mask.
   * @type string char
   */
  [char: string]: {

    /**
     * Pattern to the joker.
     * @type string pattern
     */
    pattern: RegExp;

    /**
     * Becomes the joker optional.
     * @type boolean [optional]
     */
    optional?: boolean;

    /**
     * Becomes the joker recursive.
     * @type boolean [optional]
     */
    recursive?: boolean;
  };
}

/**
 * Extra Options for NgMask.
 */
export interface MaskOptions {

  /**
   * Clears the form input if your value not match the mask.
   * @type boolean clearIfNotMatch Default value: false
   */
  clearIfNotMatch?: boolean;

  /**
   * Adds a placeholder in the form input.
   * @type string placeholder Default value: ''
   */
  placeholder?: string;

  /**
   * Becomes the mask reversible.
   * @type boolean reverse Default value: false
   */
  reverse?: boolean;

  /**
   * Selects the form input's content when the cursor focus above.
   * @type boolean selectOnFocus Default value: false
   */
  selectOnFocus?: boolean;

  /**
   * Translates jokers in the mask according the necessity of user.
   * @type Object translation
   */
  translation?: TranslationMask;
}

/**
 * Mask for NgMask.
 */
export class Mask {

  /**
   * Mask constructor.
   * @param string pattern Mask pattern.
   * @param MaskOptions options Extra options for the mask.
   */
  public constructor(
    private _pattern: string,
    private _options: MaskOptions = null
  ) { }

  public get pattern(): string {
    return this._pattern;
  }

  public get options(): MaskOptions {
    return this._options;
  }
}
