import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { isValidCnpj, isValidCpf, stripDocumentFormatting } from './core/br-documents';

const CPF_LENGTH = 11;

/**
 * Builds a validator that skips empty values (combine with `Validators.required` when needed)
 * and reports `{ [errorKey]: true }` otherwise when `isValid` fails.
 */
function documentValidator(errorKey: string, isValid: (value: string) => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    return isValid(String(value)) ? null : { [errorKey]: true };
  };
}

/** Validates CPF check digits. Error key: `cpf`. */
export const cpfValidator: ValidatorFn = documentValidator('cpf', isValidCpf);

/** Validates numeric and alphanumeric CNPJ check digits. Error key: `cnpj`. */
export const cnpjValidator: ValidatorFn = documentValidator('cnpj', isValidCnpj);

/** Validates a CPF (11 digits) or a CNPJ (any other length). Error key: `cpfCnpj`. */
export const cpfCnpjValidator: ValidatorFn = documentValidator('cpfCnpj', (value) =>
  stripDocumentFormatting(value).length === CPF_LENGTH ? isValidCpf(value) : isValidCnpj(value),
);
