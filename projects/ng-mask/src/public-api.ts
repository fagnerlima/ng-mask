/*
 * Public API Surface of @fagnerlima/ng-mask
 */

export {
  DEFAULT_TRANSLATION,
  applyMask,
  applyMaskWithCaret,
  type MaskConfig,
  type MaskEditResult,
  type MaskResult,
  type MaskToken,
  type MaskTranslation,
} from './lib/core/mask-engine';
export {
  NG_MASK_PRESETS,
  resolveMask,
  type MaskInput,
  type MaskPresetName,
} from './lib/core/presets';
export { isValidCnpj, isValidCpf, stripDocumentFormatting } from './lib/core/br-documents';
export { MaskDirective, type MaskOutput } from './lib/mask.directive';
export { MaskPipe } from './lib/mask.pipe';
export { cnpjValidator, cpfCnpjValidator, cpfValidator } from './lib/validators';
