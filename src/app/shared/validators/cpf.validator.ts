import { AbstractControl, ValidationErrors } from '@angular/forms';
import { stripCpfMask } from '../utils/cpf.utils';

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const digits = stripCpfMask(control.value);
  if (digits.length !== 11) {
    return { cpf: 'CPF deve ter 11 dígitos' };
  }
  return null;
}
