// mon-devfolio.component.ts
import { Component, inject, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PortfolioService, Project, Skill, Experience } from '../../portfolio';
import { AuthService } from '../../auth';

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

  // State
  activeTab = signal<Tab>('infos');
  previewView = signal<View>('portfolio');
  activeProject = signal<Project | null>(null);
  saved = signal(false);
  colors = COLORS;
  isLoading = signal(false);
  fullPreview = signal(false);
  tabsList: Tab[] = ['infos', 'competences', 'projets', 'experience', 'formation'];


  // Portfolio data
  profile = this.portfolioSvc.profile;
  projects = this.portfolioSvc.projects;
  skills = this.portfolioSvc.skills;
  experiences = this.portfolioSvc.experiences;
  formations = signal<Formation[]>([]);

  // Form models
  profileForm: any = {
    ...this.profile(),
    yearsExp: (this.profile() as any).yearsExp ?? 0,
    availability: (this.profile() as any).availability ?? '',
    specialization: (this.profile() as any).specialization ?? '',
    languages: (this.profile() as any).languages ?? '',
    dailyRate: (this.profile() as any).dailyRate ?? ''
  };
  newSkill = { name: '', category: 'technique', pct: 80 };
  newProject = {
    name: '', description: '', readme: '', tech: '',
    url: '', github: '', pct: 0, color: '#3B82F6',
    role: '', startDate: '', endDate: '',
    objectives: '', challenges: '', featuresText: '', impact: ''
  };
  newExp = { 
    role: '', company: '', start: '', end: '', 
    description: '', achievements: [] as string[] 
  };
  newFormation = { degree: '', institution: '', startDate: '', endDate: '', description: '' };

  // Computed
  slug = computed(() =>
    this.profile().name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  );

  hasContent = computed(() =>
    !!this.profile().name || this.projects().length > 0 ||
    this.skills().length > 0 || this.experiences().length > 0
  );

  technicalSkills = computed(() =>
    this.skills().filter(s => s.category === 'technique')
  );

  softSkills = computed(() =>
    this.skills().filter(s => s.category === 'soft')
  );

  completedProjects = computed(() =>
    this.projects().filter(p => p.pct === 100)
  );

  inProgressProjects = computed(() =>
    this.projects().filter(p => p.pct < 100 && p.pct > 0)
  );

  constructor() {
    // Auto-save effect
    effect(() => {
      const profile = this.profile();
      if (profile.name) {
        localStorage.setItem('portfolio-draft', JSON.stringify({
          profile: this.profile(),
          projects: this.projects(),
          skills: this.skills(),
          experiences: this.experiences()
        }));
      }
    });

    this.loadDraft();
    this.loadFormations();
    this.handleHighlight();
  }

  private handleHighlight() {
    this.route.queryParams.subscribe(params => {
      const id = params['highlight'];
      if (id) {
        const project = this.portfolioSvc.projects().find(p => p.id === id);
        if (project) {
          this.openProjectDetail(project);
          this.setTab('projets');
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

  // Tab management
setTab(tab: string) { 
  this.activeTab.set(tab as Tab); 
}
  // Profile management
  onProfileInput() {
    this.portfolioSvc.updateProfile({ ...this.profileForm });
  }

  selectColor(color: string) {
    this.profileForm.accentColor = color;
    this.portfolioSvc.updateProfile({ accentColor: color });
  }

  // Skills management
  addSkill() {
    if (!this.newSkill.name.trim()) return;
    this.portfolioSvc.addSkill({
      name: this.newSkill.name.trim(),
      category: this.newSkill.category as any,
      pct: this.newSkill.pct,
      color: this.profile().accentColor
    });
    this.newSkill = { name: '', category: 'technique', pct: 80 };
  }

  removeSkill(id: string) { this.portfolioSvc.removeSkill(id); }

  // Projects management
  addProject() {
    if (!this.newProject.name.trim()) return;
    const tech = this.newProject.tech.split(',')
      .map(t => t.trim())
      .filter(Boolean);

    // Créer le projet sans la propriété 'stack'
    const projectData = {
      name: this.newProject.name.trim(),
      description: this.newProject.description.trim(),
      readme: this.buildReadme(),
      tech: tech,
      url: this.newProject.url.trim(),
      github: this.newProject.github.trim(),
      pct: this.newProject.pct,
      color: this.newProject.color || this.profile().accentColor,
      stack: tech.join(' · '),
      role: this.newProject.role.trim(),
      startDate: this.newProject.startDate.trim(),
      endDate: this.newProject.endDate.trim(),
      impact: this.newProject.impact.trim(),
      features: this.newProject.featuresText
        ? this.newProject.featuresText.split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean)
        : [] // Ajouter stack manuellement
    };

    this.portfolioSvc.addProject(projectData);
    this.resetProjectForm();
  }

  private resetProjectForm() {
    this.newProject = {
      name: '', description: '', readme: '', tech: '',
      url: '', github: '', pct: 0, color: '#3B82F6',
      role: '', startDate: '', endDate: '',
      objectives: '', challenges: '', featuresText: '', impact: ''
    };
  }

  removeProject(id: string) {
    if (this.activeProject()?.id === id) this.closeProjectDetail();
    this.portfolioSvc.removeProject(id);
  }

  updateProjectPct(project: Project, pct: number) {
    this.portfolioSvc.updateProject(project.id, { ...project, pct });
  }

  // Experience management
  addExperience() {
    if (!this.newExp.role.trim()) return;
    const achievements = this.newExp.achievements.filter(a => a.trim());
    
    // Créer l'expérience sans le champ 'achievements' s'il n'existe pas dans l'interface
    const experienceData = {
      role: this.newExp.role,
      company: this.newExp.company,
      start: this.newExp.start,
      end: this.newExp.end,
      description: this.newExp.description
    };
    
    this.portfolioSvc.addExperience(experienceData);
    this.resetExpForm();
  }

  private resetExpForm() {
    this.newExp = {
      role: '', company: '', start: '', end: '',
      description: '', achievements: []
    };
  }

  removeExperience(id: string) { this.portfolioSvc.removeExperience(id); }

  addAchievement() {
    this.newExp.achievements.push('');
  }

  removeAchievement(index: number) {
    this.newExp.achievements.splice(index, 1);
  }

  // Formation management
  addFormation() {
    if (!this.newFormation.degree.trim()) return;
    const formation: Formation = {
      id: crypto.randomUUID(),
      ...this.newFormation
    };
    this.formations.update(f => [...f, formation]);
    this.saveFormations();
    this.newFormation = { degree: '', institution: '', startDate: '', endDate: '', description: '' };
  }

  removeFormation(id: string) {
    this.formations.update(f => f.filter(fm => fm.id !== id));
    this.saveFormations();
  }

  // Preview navigation
  openProjectDetail(project: Project) {
    this.activeProject.set(project);
    this.previewView.set('project-detail');
  }

  closeProjectDetail() {
    this.previewView.set('portfolio');
    this.activeProject.set(null);
  }

  goToPublicProject(id: string) {
    this.router.navigate(['/portfolio', this.slug(), 'project', id]);
  }

  // Export functionality
  @HostListener('document:keydown.escape')
  onEscKey(): void {
    if (this.fullPreview()) {
      this.fullPreview.set(false);
      this.closeProjectDetail();
    }
  }

  toggleFullPreview(): void {
    this.fullPreview.update(v => !v);
  }

  async exportPortfolio() {
    this.isLoading.set(true);
    const portfolioData = {
      profile: this.profile(),
      projects: this.projects(),
      skills: this.skills(),
      experiences: this.experiences(),
      formations: this.formations(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${this.slug()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.isLoading.set(false);
  }

  async importPortfolio(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.isLoading.set(true);
    const file = input.files[0];
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.profile) this.portfolioSvc.updateProfile(data.profile);
    if (data.projects) data.projects.forEach((p: Project) => this.portfolioSvc.addProject(p));
    if (data.skills) data.skills.forEach((s: Skill) => this.portfolioSvc.addSkill(s));
    if (data.experiences) data.experiences.forEach((e: Experience) => this.portfolioSvc.addExperience(e));
    if (data.formations) this.formations.set(data.formations);

    this.isLoading.set(false);
    input.value = '';
  }

  resetAll() {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toutes vos données ? Cette action est irréversible.')) return;

    this.profileForm = {
      name: '', title: '', bio: '', email: '', phone: '',
      location: '', avatar: '', github: '', linkedin: '',
      website: '', accentColor: '#3B82F6',
      yearsExp: 0, availability: '', specialization: '', languages: '', dailyRate: ''
    };
    this.portfolioSvc.updateProfile(this.profileForm);
    this.formations.set([]);
    this.saveFormations();
    localStorage.removeItem('portfolio-draft');
  }

  // Helpers
  private buildReadme(): string {
    const p = this.newProject;
    const tech = p.tech.split(',').map(t => t.trim()).filter(Boolean);
    if (!p.objectives && !p.challenges && !p.featuresText && !p.impact && !p.readme) {
      return this.generateReadme(p.name.trim(), tech);
    }
    let md = `# ${p.name.trim()}\n\n`;
    if (p.description) md += `## Description\n${p.description.trim()}\n\n`;
    if (p.objectives) md += `## 🎯 Objectifs\n${p.objectives.trim()}\n\n`;
    if (tech.length) md += `## 🛠️ Stack Technique\n${tech.map(t => '- **' + t + '**').join('\n')}\n\n`;
    if (p.featuresText) {
      md += `## ✅ Fonctionnalités\n`;
      p.featuresText.split('\n').filter(l => l.trim()).forEach(line => {
        md += (line.startsWith('-') ? line : `- ${line}`) + '\n';
      });
      md += '\n';
    }
    if (p.challenges) md += `## ⚡ Défis Techniques\n${p.challenges.trim()}\n\n`;
    if (p.impact) md += `## 📈 Impact & Résultats\n${p.impact.trim()}\n\n`;
    if (p.role) md += `## 👤 Mon Rôle\n${p.role.trim()}\n\n`;
    if (p.startDate || p.endDate) md += `## 📅 Période\n${p.startDate || '?'} → ${p.endDate || 'En cours'}\n\n`;
    if (p.readme) md += p.readme.trim();
    return md;
  }

  private generateReadme(name: string, tech: string[]): string {
    return `# ${name}

## 🚀 Description
Projet professionnel développé avec ${tech.join(', ')}.

## ✨ Fonctionnalités principales
- Interface utilisateur moderne et responsive
- Architecture modulaire et maintenable
- Performance optimisée

## 🛠️ Stack technique
${tech.map(t => '- **' + t + '**').join('\n')}

## 📈 Résultats
- Performance optimale
- Code maintenable et scalable

## 💡 Ce que j'ai appris
Ce projet m'a permis de renforcer mes compétences en architecture logicielle et en bonnes pratiques de développement.`;
  }

  parseReadme(text: string | undefined): SafeHtml {
    if (!text) return '';
    let html = text
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
        `<pre><code class="language-${lang || 'plaintext'}">${this.escapeHtml(code.trim())}</code></pre>`
      )
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/^(?!<[hulp])(.+)$/gm, m => m.startsWith('<') ? m : `<p>${m}</p>`);

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getTech(p: Project): string[] {
    return p.tech || [];
  }

  // Statistiques
  getStats() {
    return {
      projects: this.projects().length,
      skills: this.skills().length,
      experience: this.experiences().length,
      completionRate: Math.round(
        this.projects().reduce((acc, p) => acc + p.pct, 0) / (this.projects().length || 1)
      )
    };
  }
}