import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaskDirective, MaskPresetName, applyMask, resolveMask } from '@fagnerlima/ng-mask';

/** Input attributes that bring up the right keyboard and autofill for a preset. */
export interface FieldAttributes {
  readonly type?: 'text' | 'tel';
  readonly inputmode?: 'numeric' | 'text' | 'tel';
  readonly autocapitalize?: 'characters';
  readonly autocomplete?: string;
}

/** One preset playground: the masked field, its format hint, raw value and completeness. */
@Component({
  selector: 'app-preset-field',
  imports: [FormsModule, MaskDirective],
  template: `
    <div class="field">
      <label class="field__label" [for]="id()">
        <code>{{ preset() }}</code> {{ label() }}
      </label>
      <input
        [id]="id()"
        [type]="attributes().type ?? 'text'"
        [attr.inputmode]="attributes().inputmode"
        [attr.autocapitalize]="attributes().autocapitalize"
        [attr.autocomplete]="attributes().autocomplete ?? 'off'"
        [attr.name]="preset()"
        [attr.aria-describedby]="id() + '-hint ' + id() + '-meta'"
        [(ngModel)]="value"
        [mask]="preset()"
        spellcheck="false"
      />
      <p class="field__hint" [id]="id() + '-hint'">Format: {{ hint() }}</p>
      <p class="field__meta" [id]="id() + '-meta'">
        raw: <code>{{ raw() || '—' }}</code>
        @if (value()) {
          <span [class.ok]="complete()">{{ complete() ? 'complete' : 'incomplete' }}</span>
        }
      </p>
    </div>
  `,
})
export class PresetField {
  readonly preset = input.required<MaskPresetName>();
  readonly label = input('');
  readonly hint = input('');
  readonly attributes = input<FieldAttributes>({});

  protected readonly id = computed(() => `preset-${this.preset()}`);
  protected readonly value = signal('');
  private readonly result = computed(() => {
    const config = resolveMask(this.preset());

    return config ? applyMask(this.value(), config) : null;
  });
  protected readonly raw = computed(() => this.result()?.raw ?? '');
  protected readonly complete = computed(() => this.result()?.complete ?? false);
}
