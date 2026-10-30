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
  MaskConfig,
  MaskDirective,
  MaskPipe,
  MaskPresetName,
  cpfCnpjValidator,
} from '@fagnerlima/ng-mask';

import { PresetField } from './preset-field';

interface PresetExample {
  readonly name: MaskPresetName;
  readonly description: string;
  readonly example: string;
}

@Component({
  selector: 'app-root',
  imports: [JsonPipe, FormsModule, ReactiveFormsModule, MaskDirective, MaskPipe, PresetField],
  templateUrl: './app.html',
})
export class App {
  protected readonly brazilianPresets: readonly PresetExample[] = [
    { name: 'brCpf', description: 'CPF', example: '000.000.000-00' },
    { name: 'brCnpj', description: 'CNPJ, numeric or alphanumeric', example: '12.ABC.345/01DE-35' },
    { name: 'brCpfCnpj', description: 'CPF or CNPJ, by length', example: 'CPF or CNPJ' },
    { name: 'brTelefone', description: 'landline or mobile', example: '(00) 0000-0000' },
    { name: 'brCelular', description: 'mobile', example: '(00) 00000-0000' },
    { name: 'brCep', description: 'postal code', example: '00000-000' },
    { name: 'brData', description: 'date', example: 'dd/mm/aaaa' },
    { name: 'brHora', description: 'time', example: 'hh:mm' },
    { name: 'brDataHora', description: 'date and time', example: 'dd/mm/aaaa hh:mm' },
    { name: 'brMoeda', description: 'money, right to left', example: '0,00' },
    { name: 'brPlaca', description: 'old or Mercosul plate', example: 'ABC-1234 / BRA2E19' },
  ];

  protected readonly otherPresets: readonly PresetExample[] = [
    { name: 'usPhone', description: 'US phone', example: '(000) 000-0000' },
    { name: 'date', description: 'date', example: 'mm/dd/yyyy' },
    { name: 'time', description: 'time', example: 'hh:mm:ss' },
    { name: 'dateTime', description: 'date and time', example: 'mm/dd/yyyy hh:mm:ss' },
    { name: 'coordinateLat', description: 'latitude', example: "000º00.0000'N" },
    { name: 'coordinateLong', description: 'longitude', example: "000º00.0000'E" },
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

  protected readonly templateCep = signal('01310930');

  protected readonly customPattern = signal('AAA-9999');
  protected readonly customReverse = signal(false);
  protected readonly customMask = computed<MaskConfig>(() => ({
    pattern: this.customPattern() || ' ',
    reverse: this.customReverse(),
  }));
  protected readonly customValue = signal('');

  protected readonly pipeSamples = [
    { value: '12345678909', mask: 'brCpf' },
    { value: '12abc34501de35', mask: 'brCnpj' },
    { value: '11987654321', mask: 'brTelefone' },
    { value: '123456789', mask: 'brMoeda' },
  ] as const;

  protected submit(): void {
    this.form.markAllAsTouched();
    this.submitted.set(this.form.valid ? this.form.getRawValue() : null);
  }
}
