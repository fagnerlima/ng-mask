import { Pipe, PipeTransform } from '@angular/core';

import { applyMask } from './core/mask-engine';
import { MaskInput, resolveMask } from './core/presets';

/**
 * Formats a value for display: `{{ customer.cpf | mask: 'brCpf' }}`.
 * `null`/`undefined` become an empty string; an empty mask returns the value unchanged.
 */
@Pipe({ name: 'mask' })
export class MaskPipe implements PipeTransform {
  transform(value: string | number | null | undefined, mask: MaskInput): string {
    const text = value === null || value === undefined ? '' : String(value);
    const config = resolveMask(mask);

    return config ? applyMask(text, config).masked : text;
  }
}
