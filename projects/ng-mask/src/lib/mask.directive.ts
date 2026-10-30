import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import {
  MaskConfig,
  MaskResult,
  applyMask,
  applyMaskWithCaret,
  formatValue,
} from './core/mask-engine';
import { MaskInput, resolveMask } from './core/presets';

/** Which representation of the value the directive writes to the form model. */
export type MaskOutput = 'masked' | 'raw';

type TextField = HTMLInputElement | HTMLTextAreaElement;

/**
 * Masks an `<input>` or `<textarea>` as the user types. Works on its own or as the
 * `ControlValueAccessor` of `ngModel`, `formControl` and `formControlName`.
 *
 * ```html
 * <input mask="brCpf" formControlName="cpf" maskOutput="raw" />
 * ```
 */
@Directive({
  // Kept unprefixed for compatibility with the 2.x `[mask]` attribute.
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[mask]',
  exportAs: 'ngMask',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MaskDirective), multi: true },
  ],
  host: {
    '(input)': 'onInput($event)',
    '(blur)': 'onBlur()',
    '(focus)': 'onFocus()',
    '(compositionstart)': 'onCompositionStart()',
    '(compositionend)': 'onCompositionEnd()',
  },
})
export class MaskDirective implements ControlValueAccessor {
  /** Preset name (`brCpf`), pattern (`000.000.000-00`) or {@link MaskConfig}. Empty disables masking. */
  readonly mask = input.required<MaskInput>();
  /** Writes the masked value (default, as in 2.x) or only the raw characters to the model. */
  readonly maskOutput = input<MaskOutput>('masked');
  /** Clears the field on blur when the value does not fill the mask. */
  readonly maskClearIfNotMatch = input(false, { transform: booleanAttribute });
  /** Selects the whole value when the field gets focus. */
  readonly maskSelectOnFocus = input(false, { transform: booleanAttribute });
  /** Sets the field's `placeholder` attribute. */
  readonly maskPlaceholder = input<string>();

  private readonly element: TextField = inject<ElementRef<TextField>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly config = computed(() => resolveMask(this.mask()));

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private lastOutput = '';
  private composing = false;

  constructor() {
    effect(() => {
      const config = this.config();
      this.maskOutput();
      untracked(() => this.reformat(config));
    });

    effect(() => {
      const placeholder = this.maskPlaceholder();

      if (placeholder !== undefined) {
        this.renderer.setAttribute(this.element, 'placeholder', placeholder);
      }
    });
  }

  writeValue(value: unknown): void {
    const config = this.config();
    const modelValue = typeof value === 'number' || value == null ? value : String(value);
    const result = config
      ? formatValue(modelValue, config)
      : this.format(modelValue == null ? '' : String(modelValue));

    this.renderer.setProperty(this.element, 'value', result.masked);
    this.lastOutput = this.toOutput(result);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.element, 'disabled', isDisabled);
  }

  protected onInput(event: Event): void {
    if (this.composing) {
      return;
    }

    const config = this.config();
    const { value, selectionStart } = this.element;

    if (!config) {
      this.emit({ masked: value, raw: value, complete: true });
      return;
    }

    const deleteBackward = (event as InputEvent).inputType === 'deleteContentBackward';
    const result = applyMaskWithCaret(
      value,
      selectionStart ?? value.length,
      config,
      deleteBackward,
    );

    this.element.value = result.masked;
    this.moveCaret(result.caret);
    this.emit(result);
  }

  protected onBlur(): void {
    const { value } = this.element;

    if (this.maskClearIfNotMatch() && value !== '' && !this.format(value).complete) {
      this.element.value = '';
      this.emit(this.format(''));
    }

    this.onTouched();
  }

  protected onFocus(): void {
    if (this.maskSelectOnFocus()) {
      this.element.select();
    }
  }

  protected onCompositionStart(): void {
    this.composing = true;
  }

  /** IME input is masked once the composed text is committed. */
  protected onCompositionEnd(): void {
    this.composing = false;
    this.onInput(new Event('input'));
  }

  /** Re-applies the mask when the mask or the output mode changes after the value was set. */
  private reformat(config: MaskConfig | null): void {
    const { value } = this.element;

    if (value === '' || !config) {
      return;
    }

    const result = applyMask(value, config);
    this.element.value = result.masked;
    this.emit(result);
  }

  private format(value: string): MaskResult {
    const config = this.config();

    return config ? applyMask(value, config) : { masked: value, raw: value, complete: true };
  }

  private toOutput(result: MaskResult): string {
    return this.maskOutput() === 'raw' ? result.raw : result.masked;
  }

  private emit(result: MaskResult): void {
    const output = this.toOutput(result);

    if (output !== this.lastOutput) {
      this.lastOutput = output;
      this.onChange(output);
    }
  }

  /** Only move the caret of a focused field: some browsers focus the element otherwise. */
  private moveCaret(position: number): void {
    const focused = this.element.ownerDocument.activeElement === this.element;

    if (focused && this.element.selectionStart !== null) {
      this.element.setSelectionRange(position, position);
    }
  }
}
