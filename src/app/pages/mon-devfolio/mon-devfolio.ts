import { Component, inject, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PortfolioService, Project, Skill, Experience } from '../../data/portfolio';

type View = 'portfolio' | 'project-detail';
type Tab = 'infos' | 'competences' | 'projets' | 'experience' | 'formation';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'
];

interface Formation {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

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

  // State
  activeTab     = signal<Tab>('infos');
  previewView   = signal<View>('portfolio');
  activeProject = signal<Project | null>(null);
  saved         = signal(false);
  colors        = COLORS;
  isLoading     = signal(false);
  fullPreview   = signal(false);
  tabsList: Tab[] = ['infos', 'competences', 'projets', 'experience', 'formation'];

  // Portfolio data
  profile     = this.portfolioSvc.myProfile;
  projects    = this.portfolioSvc.myProjects;
  skills      = this.portfolioSvc.mySkills;
  experiences = signal<any[]>([]);
  formations  = signal<Formation[]>([]);

  // Form models
  profileForm: any = { accentColor: '#F5C518' };

  newSkill = { name: '', category: 'technique', pct: 80 };

  newProject: any = {
    name: '', description: '', readme: '', technologiesText: '',  // ✅ était 'tech'
    url: '', github: '', pct: 0, color: '#3B82F6',
    role: '', startDate: '', endDate: '',
    objectives: '', challenges: '', featuresText: '', impact: ''
  };

  newExp: any = {
    role: '', company: '', start: '', end: '',
    description: '', achievements: [] as string[]
  };

  newFormation = { degree: '', institution: '', startDate: '', endDate: '', description: '' };

  // Computed
  slug = signal<string>('mon-devfolio');

  hasContent = computed(() =>
    this.projects().length > 0 || this.skills().length > 0 || this.experiences().length > 0
  );

  technicalSkills = computed(() =>
    this.skills().filter((s: Skill) => s.category === 'technique')
  );

  softSkills = computed(() =>
    this.skills().filter((s: Skill) => s.category === 'soft')
  );

  completedProjects = computed(() =>
    this.projects().filter((p: Project) => p.pct === 100)
  );

  inProgressProjects = computed(() =>
    this.projects().filter((p: Project) => p.pct < 100 && p.pct > 0)
  );

  private handleFullscreen() {
    this.route.queryParams.subscribe(params => {
      if (params['fullscreen'] === 'true') {
        this.fullPreview.set(true);
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  constructor() {
    this.loadFormations();
    this.handleHighlight();
    this.handleFullscreen();
  }

  private handleHighlight() {
    this.route.queryParams.subscribe(params => {
      const id = params['highlight'];
      if (id) {
        const project = this.projects().find((p: Project) => p.id === Number(id));
        if (project) {
          this.openProjectDetail(project);
          this.setTab('projets');
        }
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  private loadFormations() {
    const saved = localStorage.getItem('formations');
    if (saved) this.formations.set(JSON.parse(saved));
  }

  private saveFormations() {
    localStorage.setItem('formations', JSON.stringify(this.formations()));
  }

  // Tab
  setTab(tab: string) { this.activeTab.set(tab as Tab); }

  getTabIcon(tab: string): string {
    const icons: Record<string, string> = {
      infos: 'ti ti-user', competences: 'ti ti-tools',
      projets: 'ti ti-folder', experience: 'ti ti-briefcase', formation: 'ti ti-school'
    };
    return icons[tab] || 'ti ti-circle';
  }

  getTabLabel(tab: string): string {
    const labels: Record<string, string> = {
      infos: 'Infos', competences: 'Compétences',
      projets: 'Projets', experience: 'Expérience', formation: 'Formation'
    };
    return labels[tab] || tab;
  }

  // Profile
  onProfileInput() {}
  selectColor(color: string) { this.profileForm.accentColor = color; }

  // Skills
  addSkill() {
    if (!this.newSkill.name.trim()) return;
    this.portfolioSvc.addSkill({
      name: this.newSkill.name.trim(),
      category: this.newSkill.category as any,
      pct: this.newSkill.pct,
      color: this.profileForm.accentColor
    });
    this.newSkill = { name: '', category: 'technique', pct: 80 };
  }

  removeSkill(id: number) { this.portfolioSvc.deleteSkill(id); }

  // Projects
  addProject() {
    if (!this.newProject.name) return;

    // ✅ technologiesText → technologies[]
    const technologies = this.newProject.technologiesText
      ?.split(',')
      .map((t: string) => t.trim())
      .filter(Boolean) ?? [];

    this.portfolioSvc.addProject({
      name:         this.newProject.name.trim(),
      description:  this.newProject.description.trim(),
      technologies,                                        // ✅ unique champ
      pct:          this.newProject.pct,
      color:        this.newProject.color || this.profileForm.accentColor,
      github:       this.newProject.github,
      url:          this.newProject.url,
      readme:       this.newProject.readme,
      role:         this.newProject.role,
      startDate:    this.newProject.startDate,
      endDate:      this.newProject.endDate,
      impact:       this.newProject.impact,
      features:     this.newProject.featuresText
        ? this.newProject.featuresText
            .split('\n')
            .map((l: string) => l.replace(/^-\s*/, '').trim())
            .filter(Boolean)
        : []
    });

    this.newProject = {
      name: '', description: '', readme: '', technologiesText: '',
      url: '', github: '', pct: 0, color: '#3B82F6',
      role: '', startDate: '', endDate: '',
      objectives: '', challenges: '', featuresText: '', impact: ''
    };
  }

  removeProject(id: number) {
    if (this.activeProject()?.id === id) this.closeProjectDetail();
    this.portfolioSvc.removeProject(id);
  }

  updateProjectPct(project: Project, pct: number) {
    this.portfolioSvc.updateProject(project.id, { ...project, pct });
  }

  // Experience
  addExperience() {
    if (!this.newExp.role?.trim() && !this.newExp.description?.trim()) return;
    this.experiences.update((list: any[]) => [...list, { id: Date.now(), ...this.newExp }]);
    this.newExp = { role: '', company: '', start: '', end: '', description: '', achievements: [] };
  }

  removeExperience(id: number) {
    this.experiences.update((list: any[]) => list.filter((e: any) => e.id !== id));
  }

  addAchievement() { this.newExp.achievements.push(''); }
  removeAchievement(index: number) { this.newExp.achievements.splice(index, 1); }

  // Formation
  addFormation() {
    if (!this.newFormation.degree.trim()) return;
    const formation: Formation = { id: crypto.randomUUID(), ...this.newFormation };
    this.formations.update(f => [...f, formation]);
    this.saveFormations();
    this.newFormation = { degree: '', institution: '', startDate: '', endDate: '', description: '' };
  }

  removeFormation(id: string) {
    this.formations.update(f => f.filter(fm => fm.id !== id));
    this.saveFormations();
  }

  // Preview
  openProjectDetail(project: Project) {
    this.activeProject.set(project);
    this.previewView.set('project-detail');
  }

  closeProjectDetail() {
    this.previewView.set('portfolio');
    this.activeProject.set(null);
  }

  goToPublicProject(id: number) {
    this.router.navigate(['/portfolio', this.slug(), 'project', id]);
  }

  @HostListener('document:keydown.escape')
  onEscKey(): void {
    if (this.fullPreview()) {
      this.fullPreview.set(false);
      this.closeProjectDetail();
    }
  }

  toggleFullPreview(): void { this.fullPreview.update(v => !v); }

  parseReadme(text?: string): SafeHtml {
    if (!text) return '';
    const html = text
      .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
      .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
      .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/`([^`]+)`/g,     '<code>$1</code>')
      .replace(/^- (.+)$/gm,    '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
      .replace(/\n{2,}/g, '</p><p>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getStats() {
    return {
      projects:       this.projects().length,
      skills:         this.skills().length,
      experience:     this.experiences().length,
      completionRate: Math.round(
        this.projects().reduce((acc: number, p: Project) => acc + p.pct, 0) /
        (this.projects().length || 1)
      )
    };
  }

  resetAll() {
    if (!confirm('Réinitialiser toutes les données ?')) return;
    this.formations.set([]);
    this.saveFormations();
  }

  async exportPortfolio() {
    const data = {
      projects:    this.projects(),
      skills:      this.skills(),
      formations:  this.formations(),
      exportedAt:  new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `portfolio-${this.slug()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}