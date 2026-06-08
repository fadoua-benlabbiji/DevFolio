import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PortfolioService, Project } from '../../data/portfolio';
import { ProfileService } from '../../data/profile';

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
    return this.portfolio.myProjects().find((p: Project) => p.id === id) ?? null;
  });

  readonly otherProjects = computed(() => {
    const current = this.project();
    return this.portfolio.myProjects()
      .filter((p: Project) => p.id !== current?.id)
      .slice(0, 3);
  });

  // ✅ plus de fallback sur stack — technologies est obligatoire
  readonly techTags = computed(() => {
    const p = this.project();
    if (!p) return [];
    return p.technologies ?? [];
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

  viewProject(projectId: number): void {
    this.router.navigate(['/dashboard/project-detail', projectId]);
  }
}