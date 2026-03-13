import { Pipe, PipeTransform } from '@angular/core';
import { formatCpf } from '../utils/cpf.utils';

@Pipe({ name: 'cpf' })
export class CpfPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return formatCpf(value);
  }
}
