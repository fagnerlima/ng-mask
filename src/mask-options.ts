/**
 * Interface used for the maskOptions transferred to the MaskDirective.
 *
 * @author Fagner Lima
 * @since 1.0.0
 */
export interface MaskOptions {
  /**
   * @type boolean [optional]
   */
  clearIfNotMatch?: boolean,

  /**
   * @type string [optional]
   */
  placeholder?: string,

  /**
   * @type boolean [optional]
   */
  reverse?: boolean,

  /**
   * @type boolean [optional]
   */
  selectOnFocus?: boolean,

  /**
   * @type Object [optional]
   */
  translation?: {
    /**
     * @type string
     */
    pattern: string,

    /**
     * @type boolean [optional]
     */
    optional?: boolean,

    /**
     * @type boolean [optional]
     */
    recursive?: boolean
  }
}
