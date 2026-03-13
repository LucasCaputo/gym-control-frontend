import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { applyCpfMask, stripCpfMask } from '../../utils/cpf.utils';

@Directive({
  selector: '[appCpfMask]',
  host: {
    '(input)': 'onInput($event)',
  },
})
export class CpfMaskDirective {
  private readonly el = inject(ElementRef);
  private readonly control = inject(NgControl);

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const masked = applyCpfMask(input.value);
    input.value = masked;
    this.control.control?.setValue(stripCpfMask(masked), { emitEvent: true });
  }
}
