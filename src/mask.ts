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

export interface Mask {

  /**
   *
   * @type RegExp|string
   */
  pattern: RegExp | string;

  /**
   *
   * @type MaskOptions [optional]
   */
  options?: MaskOptions;
}
