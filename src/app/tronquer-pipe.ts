import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tronquer', standalone: true })
export class TronquerPipe implements PipeTransform {
  transform(value: string, limit: number = 80, suffix: string = '…'): string {
    if (!value) return '';
    return value.length <= limit ? value : value.slice(0, limit).trimEnd() + suffix;
  }
}