import { JsonPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MaskDirective,
  MaskInput,
  MaskPipe,
  MaskPresetName,
  cpfCnpjValidator,
} from '@fagnerlima/ng-mask';

import { FieldAttributes, PresetField } from './preset-field';

interface PresetExample {
  readonly name: MaskPresetName;
  readonly label: string;
  readonly hint: string;
  readonly attributes: FieldAttributes;
}

const NUMERIC: FieldAttributes = { inputmode: 'numeric' };
const UPPER_TEXT: FieldAttributes = { inputmode: 'text', autocapitalize: 'characters' };
const PHONE: FieldAttributes = { type: 'tel', autocomplete: 'tel-national' };

type FormField = 'name' | 'document' | 'phone' | 'amount';

/** Long enough for screen readers to notice the live region was emptied. */
const ANNOUNCE_DELAY_MS = 100;

@Component({
  selector: 'app-root',
  imports: [JsonPipe, FormsModule, ReactiveFormsModule, MaskDirective, MaskPipe, PresetField],
  templateUrl: './app.html',
})
export class App {
  protected readonly brazilianPresets: readonly PresetExample[] = [
    { name: 'brCpf', label: 'CPF', hint: '000.000.000-00', attributes: NUMERIC },
    {
      name: 'brCnpj',
      label: 'CNPJ, numeric or alphanumeric',
      hint: 'AA.AAA.AAA/AAAA-00 (A: letter or digit)',
      attributes: UPPER_TEXT,
    },
    {
      name: 'brCpfCnpj',
      label: 'CPF or CNPJ',
      hint: '000.000.000-00 or AA.AAA.AAA/AAAA-00',
      attributes: UPPER_TEXT,
    },
    {
      name: 'brTelefone',
      label: 'landline or mobile phone',
      hint: '(00) 0000-0000 or (00) 00000-0000',
      attributes: PHONE,
    },
    { name: 'brCelular', label: 'mobile phone', hint: '(00) 00000-0000', attributes: PHONE },
    {
      name: 'brCep',
      label: 'postal code',
      hint: '00000-000',
      attributes: { ...NUMERIC, autocomplete: 'postal-code' },
    },
    { name: 'brData', label: 'date', hint: 'dd/mm/yyyy', attributes: NUMERIC },
    { name: 'brHora', label: 'time', hint: 'hh:mm', attributes: NUMERIC },
    { name: 'brDataHora', label: 'date and time', hint: 'dd/mm/yyyy hh:mm', attributes: NUMERIC },
    {
      name: 'brMoeda',
      label: 'money (R$)',
      hint: '1.234,56, typed from the right',
      attributes: NUMERIC,
    },
    {
      name: 'brPlaca',
      label: 'license plate, old or Mercosul',
      hint: 'ABC-1234 or ABC1D23',
      attributes: UPPER_TEXT,
    },
  ];

  protected readonly otherPresets: readonly PresetExample[] = [
    { name: 'usPhone', label: 'US phone', hint: '(000) 000-0000', attributes: PHONE },
    { name: 'date', label: 'date', hint: 'mm/dd/yyyy', attributes: NUMERIC },
    { name: 'time', label: 'time', hint: 'hh:mm:ss', attributes: NUMERIC },
    { name: 'dateTime', label: 'date and time', hint: 'mm/dd/yyyy hh:mm:ss', attributes: NUMERIC },
    { name: 'coordinateLat', label: 'latitude', hint: "000º00.0000'N", attributes: UPPER_TEXT },
    { name: 'coordinateLong', label: 'longitude', hint: "000º00.0000'E", attributes: UPPER_TEXT },
  ];

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    document: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, cpfCnpjValidator],
    }),
    phone: new FormControl('', { nonNullable: true }),
    amount: new FormControl('', { nonNullable: true }),
  });
  protected readonly submitted = signal<unknown>(null);
  protected readonly status = signal('');

  protected readonly templateCep = signal('01310930');

  protected readonly customPattern = signal('AAA-9999');
  protected readonly customReverse = signal(false);
  /** An empty pattern disables masking. */
  protected readonly customMask = computed<MaskInput>(() =>
    this.customPattern() ? { pattern: this.customPattern(), reverse: this.customReverse() } : '',
  );
  protected readonly customValue = signal('');

  protected readonly pipeSamples = [
    { value: '12345678909', mask: 'brCpf' },
    { value: '12abc34501de35', mask: 'brCnpj' },
    { value: '11987654321', mask: 'brTelefone' },
    { value: 1234.5, mask: 'brMoeda' },
  ] as const;

  protected showError(field: FormField): boolean {
    const control = this.form.controls[field];

    return control.touched && control.invalid;
  }

  protected submit(formElement: HTMLFormElement): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      const invalid = Object.values(this.form.controls).filter((control) => control.invalid);
      this.submitted.set(null);
      this.announce(
        `Fix ${invalid.length} ${invalid.length === 1 ? 'field' : 'fields'} before submitting.`,
      );
      formElement.querySelector<HTMLElement>('.ng-invalid[formControlName]')?.focus();
      return;
    }

    this.announce('Submitted.');
    this.submitted.set(this.form.getRawValue());
  }

  /** Clears the live region first so that repeating the same message is announced again. */
  private announce(message: string): void {
    this.status.set('');
    setTimeout(() => this.status.set(message), ANNOUNCE_DELAY_MS);
  }
}
