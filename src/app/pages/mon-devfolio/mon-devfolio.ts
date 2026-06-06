import { Component, inject, signal, computed, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../profile';
import { Profile } from '../../profile.model';
import { PortfolioService } from '../../portfolio';

@Component({
  selector: 'app-mon-devfolio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mon-devfolio.html',
  styleUrl: './mon-devfolio.css'
})
export class MonDevfolio implements OnInit, AfterViewInit {
  private profileSvc  = inject(ProfileService);
  private portfolio   = inject(PortfolioService);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private el          = inject(ElementRef);

  readonly profile    = this.profileSvc.myProfile;
  readonly skills     = this.portfolio.skills;
  readonly projects   = this.portfolio.projects;

  saved              = signal(false);
  activeSection      = signal<'identite' | 'liens' | 'apparence'>('identite');
  accentColor        = signal('#6366f1');
  highlightedId      = signal<number | null>(null);

  readonly accentColors = [
    { value: '#6366f1', label: 'Indigo'    },
    { value: '#0ea5e9', label: 'Sky'       },
    { value: '#10b981', label: 'Emeraude'  },
    { value: '#f59e0b', label: 'Ambre'     },
    { value: '#ef4444', label: 'Rouge'     },
    { value: '#ec4899', label: 'Rose'      },
    { value: '#8b5cf6', label: 'Violet'    },
    { value: '#111827', label: 'Graphite'  },
  ];

  readonly completedProjects = computed(() =>
    this.projects().filter(p => p.pct === 100).length
  );

  readonly topSkills = computed(() =>
    [...this.skills()].sort((a, b) => b.pct - a.pct).slice(0, 5)
  );

  ngOnInit(): void {
    // Lire le queryParam ?highlight=id envoyé depuis la page détail
    const highlightId = this.route.snapshot.queryParamMap.get('highlight');
    if (highlightId) {
      this.highlightedId.set(Number(highlightId));
      // Nettoyer l'URL sans recharger
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
      // Scroll vers la carte du projet puis retirer le highlight après 3s
      setTimeout(() => {
        const card = this.el.nativeElement.querySelector(`[data-project-id="${id}"]`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => this.highlightedId.set(null), 3000);
      }, 300);
    }
  }

  goToProjectDetail(projectId: number): void {
    this.router.navigate(['/portfolio/projet-public', projectId]);
  }

  patch(changes: Partial<Profile>): void {
    const current = this.profile();
    if (current) this.profileSvc.updateProfile({ ...current, ...changes });
  }

  setSection(s: 'identite' | 'liens' | 'apparence'): void {
    this.activeSection.set(s);
  }

  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}
