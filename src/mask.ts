export interface MaskOptions {

  /**
   *
   * @type boolean [optional]
   */
  clearIfNotMatch?: boolean;

  /**
   *
   * @type string [optional]
   */
  placeholder?: string;

  /**
   *
   * @type boolean [optional]
   */
  reverse?: boolean;

  /**
   *
   * @type boolean [optional]
   */
  selectOnFocus?: boolean;

  /**
   *
   * @type Object [optional]
   */
  translation?: {

    /**
     *
     * @type string
     */
    [char: string]: {

      /**
       *
       * @type string
       */
      pattern: RegExp;

      /**
       *
       * @type boolean [optional]
       */
      optional?: boolean;

      /**
       *
       * @type boolean [optional]
       */
      recursive?: boolean;
    }
  };
}

export class Mask {

  /**
   * Mask constructor.
   * @param string pattern
   * @param MaskOptions options
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
