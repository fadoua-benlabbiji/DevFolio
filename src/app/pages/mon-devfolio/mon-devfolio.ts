// mon-devfolio.component.ts
import { Component, inject, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../profile';
import { Profile } from '../../profile.model';
import { PortfolioService, Project, Skill } from '../../portfolio';

@Component({
  selector: 'app-mon-devfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl:'./mon-devfolio.html',
  styleUrls: ['./mon-devfolio.css']
})
export class MonDevfolio {
  private portfolioSvc = inject(PortfolioService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  readonly profile    = this.profileSvc.myProfile;
  readonly skills     = this.portfolio.mySkills;    // ← corrigé
  readonly projects   = this.portfolio.myProjects;  // ← corrigé


  // Portfolio data
  profile = this.portfolioSvc.profile;
  projects = this.portfolioSvc.projects;
  skills = this.portfolioSvc.skills;
  experiences = this.portfolioSvc.experiences;
  formations = signal<Formation[]>([]);

  readonly completedProjects = computed(() =>
    this.projects().filter((p: Project) => p.pct === 100).length // ← type
  );

  readonly topSkills = computed(() =>
    [...this.skills()].sort((a: Skill, b: Skill) => b.pct - a.pct).slice(0, 5) // ← type
  );

  ngOnInit(): void {
    const highlightId = this.route.snapshot.queryParamMap.get('highlight');
    if (highlightId) {
      this.highlightedId.set(Number(highlightId));
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    }
  }

  ngAfterViewInit(): void {
    const id = this.highlightedId();
    if (id !== null) {
      setTimeout(() => {
        const card = this.el.nativeElement.querySelector(`[data-project-id="${id}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Clean URL
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  private loadDraft() {
    const draft = localStorage.getItem('portfolio-draft');
    if (draft) {
      const data = JSON.parse(draft);
      if (data.profile && !this.profile().name) {
        this.portfolioSvc.updateProfile(data.profile);
        this.profileForm = { ...data.profile };
      }
    }
  }

  private loadFormations() {
    const saved = localStorage.getItem('formations');
    if (saved) {
      this.formations.set(JSON.parse(saved));
    }
  }

  private saveFormations() {
    localStorage.setItem('formations', JSON.stringify(this.formations()));
  }

  getTabIcon(tab: string): string {
    const icons: Record<string, string> = {
      infos: 'ti ti-user',
      competences: 'ti ti-tools',
      projets: 'ti ti-folder',
      experience: 'ti ti-briefcase',
      formation: 'ti ti-school'
    };
    return icons[tab] || 'ti ti-circle';
  }

  getTabLabel(tab: string): string {
    const labels: Record<string, string> = {
      infos: 'Infos',
      competences: 'Compétences',
      projets: 'Projets',
      experience: 'Expérience',
      formation: 'Formation'
    };
    return labels[tab] || tab;
  }
}