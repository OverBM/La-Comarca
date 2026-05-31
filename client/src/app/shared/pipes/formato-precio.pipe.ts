import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoPrecio',
  standalone: true,
})
export class FormatoPrecioPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'S/ 0.00';
    return `S/ ${value.toFixed(2)}`;
  }
}
