import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PortfolioService, Project, Skill } from '../../portfolio';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-mon-devfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mon-devfolio.html',
  styleUrls: ['./mon-devfolio.css']
})
export class MonDevfolio {
  private portfolioSvc = inject(PortfolioService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);
  private sanitizer    = inject(DomSanitizer);
  activeTab = signal<string>('infos');
  readonly projects = this.portfolioSvc.myProjects;
  readonly skills   = this.portfolioSvc.mySkills;
  setTab(tab: string): void {
  this.activeTab.set(tab);
}
  // profile signal vide par défaut
  readonly profile = signal<any>({
    name: '', title: '', bio: '', email: '',
    location: '', github: '', linkedin: '', website: '', avatar: ''
  });

  // experiences vide
  readonly experiences = signal<any[]>([]);

  // formations
  formations = signal<any[]>([]);
  newFormation: any = { description: '' };

  // profileForm
  profileForm: any = { accentColor: '#F5C518' };

  // preview
  previewView = signal<string>('portfolio');
  fullPreview = signal<boolean>(false);
  slug = signal<string>('mon-devfolio');

  // projet actif
  activeProject = signal<Project | null>(null);

  readonly completedProjects = computed(() =>
    this.projects().filter((p: Project) => p.pct === 100).length
  );

  readonly topSkills = computed(() =>
    [...this.skills()].sort((a: Skill, b: Skill) => b.pct - a.pct).slice(0, 5)
  );

  readonly hasContent = computed(() =>
    this.projects().length > 0 || this.skills().length > 0 || this.experiences().length > 0
  );

  addFormation(): void {
    if (!this.newFormation.description) return;
    this.formations.update(list => [...list, { id: Date.now(), ...this.newFormation }]);
    this.newFormation = { description: '' };
  }

  removeFormation(id: number): void {
    this.formations.update(list => list.filter((f: any) => f.id !== id));
  }

  openProjectDetail(p: Project): void {
    this.activeProject.set(p);
    this.previewView.set('project-detail');
  }

  closeProjectDetail(): void {
    this.activeProject.set(null);
    this.previewView.set('portfolio');
  }

  toggleFullPreview(): void {
    this.fullPreview.update(v => !v);
  }

  parseReadme(readme?: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(readme ?? '');
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
  removeExperience(id: number): void {
  this.experiences.update((list: any[]) => list.filter(e => e.id !== id));
}
newExp: any = { description: '' };

addExperience(): void {
  if (!this.newExp.description) return;
  this.experiences.update((list: any[]) => [...list, { id: Date.now(), ...this.newExp }]);
  this.newExp = { description: '' };
}
removeProject(id: number): void {
  this.portfolioSvc.removeProject(id);
}
newProject: any = { name: '', description: '', stack: '', pct: 0, color: '#F5C518' };

addProject(): void {
  if (!this.newProject.name) return;
  this.portfolioSvc.addProject(this.newProject);
  this.newProject = { name: '', description: '', stack: '', pct: 0, color: '#F5C518' };
}
removeSkill(id: number): void {
  this.portfolioSvc.deleteSkill(id);
}

}