import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initiales', standalone: true })
export class TronquerPipe implements PipeTransform {
  transform(name: string): string {
    return name
      .split(' ')
      .map(w => w.charAt(0).toUpperCase())
      .join('');
  }
}