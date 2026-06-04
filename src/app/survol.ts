import { Directive, HostListener, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appSurvol]',
  standalone: true
})
export class SurvolDirective {
  @Input() couleurSurvol: string = '#1c1c1c';
  @Input() couleurTexte: string = '';

  @HostBinding('style.background') background = '';
  @HostBinding('style.color') color = '';
  @HostBinding('style.transition') transition = 'background 0.2s, color 0.2s';

  @HostListener('mouseenter')
  onEnter(): void {
    this.background = this.couleurSurvol;
    if (this.couleurTexte) this.color = this.couleurTexte;
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.background = '';
    this.color = '';
  }
}