import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaskDirective, MaskPresetName, applyMask, resolveMask } from '@fagnerlima/ng-mask';

/** One preset playground: the masked field plus its raw value and completeness. */
@Component({
  selector: 'app-preset-field',
  imports: [FormsModule, MaskDirective],
  template: `
    <label class="field">
      <span class="field__label"
        ><code>{{ preset() }}</code> {{ description() }}</span
      >
      <input
        type="text"
        [attr.name]="preset()"
        [(ngModel)]="value"
        [mask]="preset()"
        [maskPlaceholder]="example()"
        autocomplete="off"
        spellcheck="false"
      />
      <span class="field__meta">
        raw: <code>{{ raw() || '—' }}</code>
        @if (value()) {
          <span [class.ok]="complete()">{{ complete() ? 'complete' : 'incomplete' }}</span>
        }
      </span>
    </label>
  `,
})
export class PresetField {
  readonly preset = input.required<MaskPresetName>();
  readonly description = input('');
  readonly example = input('');

  protected readonly value = signal('');
  private readonly result = computed(() => {
    const config = resolveMask(this.preset());

    return config ? applyMask(this.value(), config) : null;
  });
  protected readonly raw = computed(() => this.result()?.raw ?? '');
  protected readonly complete = computed(() => this.result()?.complete ?? false);
}
