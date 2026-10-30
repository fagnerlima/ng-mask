import { Pipe, PipeTransform } from '@angular/core';

import { formatValue } from './core/mask-engine';
import { MaskInput, resolveMask } from './core/presets';

/**
 * Formats a value for display: `{{ customer.cpf | mask: 'brCpf' }}`.
 * `null`/`undefined` become an empty string; an empty mask returns the value unchanged. With
 * fixed-point masks such as `brMoeda`, numbers are formatted with their decimals:
 * `{{ 1234.5 | mask: 'brMoeda' }}` → `1.234,50`.
 */
@Pipe({ name: 'mask' })
export class MaskPipe implements PipeTransform {
  transform(value: string | number | null | undefined, mask: MaskInput): string {
    const config = resolveMask(mask);

    if (!config) {
      return value === null || value === undefined ? '' : String(value);
    }

    return formatValue(value, config).masked;
  }
}
