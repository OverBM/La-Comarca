import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'telefono',
  standalone: true,
})
export class TelefonoPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 9) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return value;
  }
}