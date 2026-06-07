import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService } from '../../user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink], // ← RouterOutlet retiré, RouterLink ajouté
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  @Input() title: string = '';

  private router = inject(Router);
 private userService = inject(UserService);
  displayTitle = '';

  private readonly routeTitles: Record<string, string> = {
    'vue-ensemble': "Vue d'ensemble",
    'projects':     'Projets',
    'skills':       'Compétences',
    'messages':     'Messages',
    'cv':           'Générer CV',
    'devfolio':     'Mon DevFolio',
    'settings':     'Paramètres',  // ← corrigé
  };

  ngOnInit(): void {
    if (this.title) {
      this.displayTitle = this.title;
      return;
    }
    this.updateTitle();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateTitle());
  }

  private updateTitle(): void {
    const segment = this.router.url.split('/').filter(Boolean).pop() ?? '';
    this.displayTitle = this.routeTitles[segment] ?? this.title ?? "Vue d'ensemble";
  }
    logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}