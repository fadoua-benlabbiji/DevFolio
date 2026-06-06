import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterOutlet],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  /** Titre passé manuellement (optionnel — si absent, on détecte via la route) */
  @Input() title: string = '';

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  /** Titre affiché (dynamique ou statique) */
  displayTitle = '';

  /** Mapping route → titre lisible */
  private readonly routeTitles: Record<string, string> = {
    'vue-ensemble':  "Vue d'ensemble",
    'projects':      'Projets',
    'skills':        'Compétences',
    'messages':      'Messages',
    'cv':            'Générer CV',
    'devfolio':      'Mon DevFolio',
    'parametres':    'Paramètres',
  };

  ngOnInit(): void {
    // Si le parent fournit un titre fixe, on l'utilise tel quel
    if (this.title) {
      this.displayTitle = this.title;
      return;
    }

    // Sinon, on suit les changements de navigation
    this.updateTitle();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateTitle());
  }

  private updateTitle(): void {
    // Récupère le dernier segment de l'URL (ex: /projects → "projects")
    const url = this.router.url;
    const segment = url.split('/').filter(Boolean).pop() ?? '';
    const matched = this.routeTitles[segment];
    this.displayTitle = matched ?? this.title ?? "Vue d'ensemble";
  }
}