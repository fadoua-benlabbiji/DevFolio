import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PortfolioService } from '../../portfolio';
import { ProfileService } from '../../profile';

@Component({
  selector: 'app-projet-public-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projet-public-detail.html',
  styleUrl: './projet-public-detail.css'
})
export class ProjetPublicDetail implements OnInit {
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private portfolio  = inject(PortfolioService);
  private profileSvc = inject(ProfileService);

  readonly profile = this.profileSvc.myProfile;
  highlighted = signal(false);

  readonly project = computed(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.portfolio.projects().find(p => p.id === id) ?? null;
  });

  readonly otherProjects = computed(() => {
    const current = this.project();
    return this.portfolio.projects()
      .filter(p => p.id !== current?.id)
      .slice(0, 3);
  });

  readonly techTags = computed(() => {
    const p = this.project();
    if (!p) return [];
    if (p.technologies && p.technologies.length > 0) return p.technologies;
    return p.stack.split(/[·,]/).map(t => t.trim()).filter(Boolean);
  });

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBackToFolio(): void {
    const p = this.project();
    if (p) {
      this.router.navigate(['/mon-devfolio'], {
        queryParams: { highlight: p.id }
      });
    } else {
      this.router.navigate(['/mon-devfolio']);
    }
  }

  navigateProject(id: number): void {
    this.router.navigate(['/portfolio/projet-public', id]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStatusLabel(pct: number): string {
    if (pct === 100) return 'Terminé';
    if (pct >= 75)   return 'Finalisation';
    if (pct >= 50)   return 'En cours';
    if (pct >= 25)   return 'En développement';
    return 'Démarrage';
  }

  getStatusClass(pct: number): string {
    if (pct === 100) return 'done';
    if (pct >= 75)   return 'near';
    if (pct >= 50)   return 'mid';
    return 'early';
  }
}
