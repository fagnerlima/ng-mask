import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaskInput } from './core/presets';
import { MaskDirective, MaskOutput } from './mask.directive';

/** Simulates the browser: the field already holds the edited value when `input` fires. */
function edit(
  input: HTMLInputElement,
  value: string,
  caret = value.length,
  inputType = 'insertText',
) {
  input.value = value;
  input.setSelectionRange(caret, caret);
  input.dispatchEvent(new InputEvent('input', { inputType }));
}

/** Types characters one by one at the end of the field. */
function type(input: HTMLInputElement, text: string) {
  for (const char of text) {
    edit(input, input.value + char);
  }
}

@Component({
  imports: [ReactiveFormsModule, MaskDirective],
  template: `
    <input
      [formControl]="control"
      [mask]="mask()"
      [maskOutput]="output()"
      [maskClearIfNotMatch]="clearIfNotMatch()"
      [maskSelectOnFocus]="selectOnFocus()"
      [maskPlaceholder]="placeholder()"
    />
  `,
})
class ReactiveHostComponent {
  readonly control = new FormControl<string | number | null>(null);
  readonly mask = signal<MaskInput>('brCpf');
  readonly output = signal<MaskOutput>('masked');
  readonly clearIfNotMatch = signal(false);
  readonly selectOnFocus = signal(false);
  readonly placeholder = signal<string | undefined>(undefined);
}

@Component({
  imports: [FormsModule, MaskDirective],
  template: `<input name="phone" [(ngModel)]="phone" mask="brTelefone" [maskOutput]="output()" />`,
})
class TemplateHostComponent {
  readonly phone = signal<string | null>('11934567890');
  readonly output = signal<MaskOutput>('masked');
}

@Component({
  imports: [MaskDirective],
  template: `<input mask="brCep" placeholder="CEP" [maskPlaceholder]="placeholder()" />`,
})
class StandaloneHostComponent {
  readonly placeholder = signal<string | undefined>(undefined);
}

describe('MaskDirective', () => {
  describe('with reactive forms', () => {
    let fixture: ComponentFixture<ReactiveHostComponent>;
    let host: ReactiveHostComponent;
    let input: HTMLInputElement;

    async function setUp(initialValue: string | null = null) {
      fixture = TestBed.createComponent(ReactiveHostComponent);
      host = fixture.componentInstance;
      host.control.setValue(initialValue);
      await fixture.whenStable();
      input = fixture.nativeElement.querySelector('input');
    }

    it('formats the initial value without changing the model', async () => {
      await setUp('12345678909');

      expect(input.value).toBe('123.456.789-09');
      expect(host.control.value).toBe('12345678909');
      expect(host.control.dirty).toBe(false);
    });

    it('formats values set later from the model', async () => {
      await setUp();
      host.control.setValue('52998224725');

      expect(input.value).toBe('529.982.247-25');
    });

    it('clears the field when the model is reset to null', async () => {
      await setUp('12345678909');
      host.control.reset();

      expect(input.value).toBe('');
    });

    it('writes the masked value to the model while typing', async () => {
      await setUp();
      type(input, '1234');

      expect(input.value).toBe('123.4');
      expect(host.control.value).toBe('123.4');
      expect(host.control.dirty).toBe(true);
    });

    it('writes the raw value to the model with maskOutput="raw"', async () => {
      await setUp();
      host.output.set('raw');
      await fixture.whenStable();
      type(input, '12345678909');

      expect(input.value).toBe('123.456.789-09');
      expect(host.control.value).toBe('12345678909');
    });

    it('ignores invalid characters without notifying the model', async () => {
      await setUp();
      type(input, '12');
      const changes: unknown[] = [];
      host.control.valueChanges.subscribe((value) => changes.push(value));

      edit(input, '12a');

      expect(input.value).toBe('12');
      expect(changes).toEqual([]);
    });

    it('masks pasted text', async () => {
      await setUp();
      edit(input, ' 529.982.247 25 ', 16, 'insertFromPaste');

      expect(input.value).toBe('529.982.247-25');
      expect(host.control.value).toBe('529.982.247-25');
    });

    it('keeps the caret next to the edited character when typing in the middle', async () => {
      await setUp('123456');
      input.focus();
      // "123.4|56" + "9"
      edit(input, '123.4956', 6);

      expect(input.value).toBe('123.495.6');
      expect(input.selectionStart).toBe(6);
    });

    it('moves the caret before a separator removed with Backspace', async () => {
      await setUp('123456');
      input.focus();
      // "123.|456" Backspace
      edit(input, '123456', 3, 'deleteContentBackward');

      expect(input.value).toBe('123.456');
      expect(input.selectionStart).toBe(3);
    });

    it('does not move the caret of a field without focus', async () => {
      await setUp();
      const setSelectionRange = vi.spyOn(input, 'setSelectionRange');
      input.value = '1234';
      input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));

      expect(input.value).toBe('123.4');
      expect(setSelectionRange).not.toHaveBeenCalled();
    });

    it('waits for IME composition to finish before masking', async () => {
      await setUp();
      input.dispatchEvent(new CompositionEvent('compositionstart'));
      edit(input, '1234');

      expect(input.value).toBe('1234');
      expect(host.control.value).toBeNull();

      input.dispatchEvent(new CompositionEvent('compositionend'));

      expect(input.value).toBe('123.4');
      expect(host.control.value).toBe('123.4');
    });

    it('reflects the disabled state', async () => {
      await setUp();
      host.control.disable();

      expect(input.disabled).toBe(true);

      host.control.enable();

      expect(input.disabled).toBe(false);
    });

    it('marks the control as touched on blur', async () => {
      await setUp();
      input.dispatchEvent(new Event('blur'));

      expect(host.control.touched).toBe(true);
    });

    describe('maskClearIfNotMatch', () => {
      it('clears an incomplete value on blur', async () => {
        await setUp();
        host.clearIfNotMatch.set(true);
        await fixture.whenStable();
        type(input, '1234');
        input.dispatchEvent(new Event('blur'));

        expect(input.value).toBe('');
        expect(host.control.value).toBe('');
      });

      it('keeps a complete value on blur', async () => {
        await setUp();
        host.clearIfNotMatch.set(true);
        await fixture.whenStable();
        type(input, '12345678909');
        input.dispatchEvent(new Event('blur'));

        expect(input.value).toBe('123.456.789-09');
      });

      it('keeps an incomplete value when disabled (default)', async () => {
        await setUp();
        type(input, '1234');
        input.dispatchEvent(new Event('blur'));

        expect(input.value).toBe('123.4');
      });
    });

    it('selects the whole value on focus with maskSelectOnFocus', async () => {
      await setUp('12345678909');
      host.selectOnFocus.set(true);
      await fixture.whenStable();
      input.focus();
      input.dispatchEvent(new FocusEvent('focus'));

      expect([input.selectionStart, input.selectionEnd]).toEqual([0, 14]);
    });

    it('removes the placeholder when maskPlaceholder is unset', async () => {
      await setUp();
      host.placeholder.set('000.000.000-00');
      await fixture.whenStable();
      host.placeholder.set(undefined);
      await fixture.whenStable();

      expect(input.hasAttribute('placeholder')).toBe(false);
    });

    it('does not mark a pristine control dirty when the mask changes', async () => {
      await setUp('12345678909');
      const changes: unknown[] = [];
      host.control.valueChanges.subscribe((value) => changes.push(value));

      host.mask.set('00.000.000/0000-00');
      host.output.set('raw');
      await fixture.whenStable();

      expect(input.value).toBe('12.345.678/909');
      expect(host.control.value).toBe('12345678909');
      expect(host.control.pristine).toBe(true);
      expect(changes).toEqual([]);
    });

    it('does not notify a control marked as pristine after an edit when the mask changes', async () => {
      await setUp();
      type(input, '12345678909');
      host.control.markAsPristine();
      const changes: unknown[] = [];
      host.control.valueChanges.subscribe((value) => changes.push(value));

      host.mask.set('00.000.000/0000-00');
      await fixture.whenStable();

      expect(input.value).toBe('12.345.678/909');
      expect(host.control.value).toBe('123.456.789-09');
      expect(host.control.pristine).toBe(true);
      expect(changes).toEqual([]);
    });

    describe('with a pattern that starts with a digit literal (2000-00)', () => {
      beforeEach(async () => {
        await setUp();
        host.mask.set('2000-00');
        await fixture.whenStable();
        type(input, '2');
      });

      it('reads a typed "2" as input', () => {
        expect(input.value).toBe('22');
      });

      it.each([
        'deleteContentBackward',
        'deleteContentForward',
        'deleteByCut',
        'deleteWordBackward',
      ])('empties the field when %s leaves only the literal', (inputType) => {
        edit(input, '2', inputType === 'deleteContentBackward' ? 1 : 0, inputType);

        expect(input.value).toBe('');
        expect(host.control.value).toBe('');
      });

      it('empties the field when an IME commit shortens the value to the literal', () => {
        input.dispatchEvent(new CompositionEvent('compositionstart'));
        input.value = '2';
        input.dispatchEvent(new CompositionEvent('compositionend'));

        expect(input.value).toBe('');
      });

      it('reads a committed IME "2" in an empty field as input', () => {
        edit(input, '', 0, 'deleteContentBackward');
        input.dispatchEvent(new CompositionEvent('compositionstart'));
        input.value = '2';
        input.dispatchEvent(new CompositionEvent('compositionend'));

        expect(input.value).toBe('22');
      });
    });

    describe('with brMoeda', () => {
      beforeEach(async () => {
        await setUp();
        host.mask.set('brMoeda');
        await fixture.whenStable();
      });

      it('formats a numeric model value with its decimals', () => {
        host.control.setValue(1234.5);

        expect(input.value).toBe('1.234,50');
      });

      it('pads cents while typing', () => {
        type(input, '5');

        expect(input.value).toBe('0,05');
        expect(host.control.value).toBe('0,05');

        type(input, '00');

        expect(input.value).toBe('5,00');
      });

      it('keeps a raw model value written from code untouched', async () => {
        host.output.set('raw');
        await fixture.whenStable();
        host.control.setValue('1234.56');
        const changes: unknown[] = [];
        host.control.valueChanges.subscribe((value) => changes.push(value));
        await fixture.whenStable();

        expect(input.value).toBe('1.234,56');
        expect(host.control.value).toBe('1234.56');
        expect(host.control.pristine).toBe(true);
        expect(changes).toEqual([]);
      });

      it('writes a dot-decimal string with maskOutput="raw"', async () => {
        host.output.set('raw');
        await fixture.whenStable();
        type(input, '123456');

        expect(input.value).toBe('1.234,56');
        expect(host.control.value).toBe('1234.56');
      });

      it('empties the field when the last digit is deleted', () => {
        type(input, '5');
        edit(input, '0,0', 3, 'deleteContentBackward');

        expect(input.value).toBe('');
        expect(host.control.value).toBe('');
      });
    });

    it('sets the placeholder', async () => {
      await setUp();
      host.placeholder.set('000.000.000-00');
      await fixture.whenStable();

      expect(input.getAttribute('placeholder')).toBe('000.000.000-00');
    });

    it('re-applies a new mask to the current value and notifies the model', async () => {
      await setUp();
      type(input, '1234567');
      host.mask.set('brTelefone');
      await fixture.whenStable();

      expect(input.value).toBe('(12) 3456-7');
      expect(host.control.value).toBe('(12) 3456-7');
    });

    it('notifies the model when the output mode changes', async () => {
      await setUp();
      type(input, '12345678909');
      host.output.set('raw');
      await fixture.whenStable();

      expect(host.control.value).toBe('12345678909');
    });

    it('accepts a configuration object', async () => {
      await setUp();
      host.mask.set({ pattern: '#.##0,00', reverse: true });
      await fixture.whenStable();
      type(input, '123456');

      expect(input.value).toBe('1.234,56');
    });

    it('passes values through when the mask is empty', async () => {
      await setUp();
      host.mask.set('');
      await fixture.whenStable();
      edit(input, 'free text');

      expect(input.value).toBe('free text');
      expect(host.control.value).toBe('free text');
    });
  });

  describe('with template-driven forms', () => {
    let fixture: ComponentFixture<TemplateHostComponent>;
    let input: HTMLInputElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(TemplateHostComponent);
      await fixture.whenStable();
      input = fixture.nativeElement.querySelector('input');
    });

    it('formats the initial ngModel value', () => {
      expect(input.value).toBe('(11) 93456-7890');
    });

    it('updates ngModel while typing and adapts the phone mask', () => {
      edit(input, '');
      type(input, '1134567890');

      expect(input.value).toBe('(11) 3456-7890');
      expect(fixture.componentInstance.phone()).toBe('(11) 3456-7890');

      type(input, '1');

      expect(input.value).toBe('(11) 34567-8901');
      expect(fixture.componentInstance.phone()).toBe('(11) 34567-8901');
    });

    it('writes the raw value to ngModel with maskOutput="raw"', async () => {
      fixture.componentInstance.output.set('raw');
      await fixture.whenStable();
      edit(input, '(11) 93456-789');

      expect(fixture.componentInstance.phone()).toBe('1193456789');
    });

    it('formats values assigned to the model later', async () => {
      fixture.componentInstance.phone.set('1134567890');
      await fixture.whenStable();

      expect(input.value).toBe('(11) 3456-7890');
    });
  });

  describe('without forms', () => {
    it('masks a plain input and keeps its own placeholder', async () => {
      const fixture = TestBed.createComponent(StandaloneHostComponent);
      await fixture.whenStable();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      type(input, '01310930');

      expect(input.value).toBe('01310-930');
      expect(input.getAttribute('placeholder')).toBe('CEP');
    });

    it('restores its own placeholder after maskPlaceholder is unset', async () => {
      const fixture = TestBed.createComponent(StandaloneHostComponent);
      await fixture.whenStable();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      fixture.componentInstance.placeholder.set('00000-000');
      await fixture.whenStable();

      expect(input.getAttribute('placeholder')).toBe('00000-000');

      fixture.componentInstance.placeholder.set(undefined);
      await fixture.whenStable();

      expect(input.getAttribute('placeholder')).toBe('CEP');
    });
  });
});
