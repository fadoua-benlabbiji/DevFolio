import { Component, inject, signal, computed, effect, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PortfolioService, Project, Skill } from '../../data/portfolio';
import { UserService } from '../../data/user';

type View = 'portfolio' | 'project-detail';
type Tab  = 'infos' | 'competences' | 'projets' | 'experience' | 'formation';

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#6366F1'];

@Component({
  selector: 'app-mon-devfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mon-devfolio.html',
  styleUrls: ['./mon-devfolio.css'],
})
export class MonDevfolio implements OnInit {

  private portfolioSvc = inject(PortfolioService);
  private userSvc      = inject(UserService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);
  private sanitizer    = inject(DomSanitizer);


  activeTab     = signal<Tab>('infos');
  previewView   = signal<View>('portfolio');
  activeProject = signal<Project | null>(null);
  colors        = COLORS;
  fullPreview   = signal(false);
  tabsList: Tab[] = ['infos', 'competences', 'projets', 'experience', 'formation'];

  projects    = this.portfolioSvc.myProjects;
  skills      = this.portfolioSvc.mySkills;
  experiences = this.portfolioSvc.myExperiences;

  public formations = this.userSvc.myEducations;
  public languages  = this.userSvc.myLanguages;

  profileForm: any = {};

  public accentColor = computed(() =>
    this.profileForm.accentColor ?? this.userSvc.myProfile()?.accentColor ?? '#F5C518'
  );

  public slug = computed(() => {
    const p = this.userSvc.myProfile();
    return p?.username || 'mon-portfolio';
  });

 
  public profile = computed(() => {
    const p    = this.userSvc.myProfile();
    const u    = this.userSvc.currentUser();
    const email = u?.email ?? '';
    return {
      name:     p?.username   ?? '',
      title:    p?.titre      ?? '',
      bio:      p?.bio        ?? '',
      location: p?.ville      ?? '',
      avatar:   p?.avatar     ?? '',
      email,
      github:   p?.github     ?? '',
      linkedin: p?.linkedin   ?? '',
      website:  p?.website    ?? '',
    };
  });



  // ── Formulaires ───────────────────────────────────────────────────────────
  newSkill = { name: '', category: 'Frontend', pct: 80 };
  newProject: any = {
    name: '', description: '', readme: '', technologiesText: '',
    url: '', github: '', pct: 0, color: '#3B82F6',
    role: '', startDate: '', endDate: '', featuresText: '', impact: '',
  };
  newExp: any = { role: '', company: '', start: '', end: '', description: '' };
  newFormation = { diplome: '', etablissement: '', debut: '', fin: '' };
  newLanguage = { nom: '', niveau: 'Intermédiaire' };

  constructor() {
    // Initialiser profileForm depuis le profil courant
    effect(() => {
      const p = this.userSvc.myProfile();
      if (p) {
        this.profileForm = {
          name:        p.username,
          title:       p.titre,
          bio:         p.bio,
          location:    p.ville,
          avatar:      p.avatar,
          github:      p.github,
          linkedin:    p.linkedin,
          website:     p.website,
          accentColor: p.accentColor,
        };
      }
    });
  }

  ngOnInit(): void {
    // Si query param ?fullscreen=true → ouvrir directement en plein écran
    this.route.queryParams.subscribe(params => {
      if (params['fullscreen'] === 'true' || params['fullscreen'] === true) {
        this.fullPreview.set(true);
      }
    });
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  getTabIcon(tab: string): string {
    const icons: Record<string, string> = {
      infos: 'ti ti-user', competences: 'ti ti-code',
      projets: 'ti ti-folder', experience: 'ti ti-briefcase', formation: 'ti ti-school',
    };
    return icons[tab] || 'ti ti-circle';
  }

  getTabLabel(tab: string): string {
    const labels: Record<string, string> = {
      infos: 'Infos', competences: 'Compétences',
      projets: 'Projets', experience: 'Expérience', formation: 'Formation',
    };
    return labels[tab] || tab;
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  resetAll(): void {
    if (!confirm('Réinitialiser tout le portfolio ?')) return;
    // Recharge les données depuis le profil actuel
    const p = this.userSvc.myProfile();
    if (p) {
      this.profileForm = {
        name:        p.username,
        title:       p.titre,
        bio:         p.bio,
        location:    p.ville,
        avatar:      p.avatar,
        github:      p.github,
        linkedin:    p.linkedin,
        website:     p.website,
        accentColor: p.accentColor,
      };
    }
  }

  // ── Profil ────────────────────────────────────────────────────────────────
  onProfileInput(): void {
    this.userSvc.updateMyProfile({
      username:    this.profileForm.name,
      titre:       this.profileForm.title,
      bio:         this.profileForm.bio,
      ville:       this.profileForm.location,
      avatar:      this.profileForm.avatar,
      github:      this.profileForm.github,
      linkedin:    this.profileForm.linkedin,
      website:     this.profileForm.website,
      accentColor: this.profileForm.accentColor,
    });
  }

  selectColor(color: string): void {
    this.profileForm.accentColor = color;
    this.onProfileInput();
  }

  // ── Compétences ───────────────────────────────────────────────────────────
  addSkill(): void {
    if (!this.newSkill.name.trim()) return;
    this.portfolioSvc.addSkill({
      name:     this.newSkill.name.trim(),
      category: this.newSkill.category,
      pct:      this.newSkill.pct,
      color:    this.profileForm.accentColor,
    });
    this.newSkill = { name: '', category: 'Frontend', pct: 80 };
  }

  removeSkill(id: number): void { this.portfolioSvc.deleteSkill(id); }

  // ── Projets ───────────────────────────────────────────────────────────────
  addProject(): void {
    if (!this.newProject.name) return;
    const technologies = (this.newProject.technologiesText ?? '')
      .split(',').map((t: string) => t.trim()).filter(Boolean);
    const features = (this.newProject.featuresText ?? '')
      .split('\n').map((l: string) => l.replace(/^-\s*/, '').trim()).filter(Boolean);

    this.portfolioSvc.addProject({
      name: this.newProject.name.trim(),
      description: this.newProject.description.trim(),
      technologies, features,
      pct:       this.newProject.pct,
      color:     this.newProject.color || this.profileForm.accentColor,
      github:    this.newProject.github,
      url:       this.newProject.url,
      readme:    this.newProject.readme,
      role:      this.newProject.role,
      startDate: this.newProject.startDate,
      endDate:   this.newProject.endDate,
      impact:    this.newProject.impact,
    });

    this.newProject = {
      name: '', description: '', readme: '', technologiesText: '',
      url: '', github: '', pct: 0, color: '#3B82F6',
      role: '', startDate: '', endDate: '', featuresText: '', impact: '',
    };
  }

  removeProject(id: number): void {
    if (this.activeProject()?.id === id) this.closeProjectDetail();
    this.portfolioSvc.removeProject(id);
  }

  updateProjectPct(project: Project, pct: number): void {
    this.portfolioSvc.updateProject(project.id, { pct });
  }

  // ── Expériences ───────────────────────────────────────────────────────────
  addExperience(): void {
    if (!this.newExp.role?.trim()) return;
    this.portfolioSvc.addExperience({ ...this.newExp });
    this.newExp = { role: '', company: '', start: '', end: '', description: '' };
  }

  removeExperience(id: number): void { this.portfolioSvc.removeExperience(id); }

  // ── Formations ────────────────────────────────────────────────────────────
  addFormation(): void {
    if (!this.newFormation.diplome.trim()) return;
    this.userSvc.addEducation({ ...this.newFormation });
    this.newFormation = { diplome: '', etablissement: '', debut: '', fin: '' };
  }

  removeFormation(id: number): void { this.userSvc.removeEducation(id); }

  // ── Preview ───────────────────────────────────────────────────────────────
  openProjectDetail(project: Project): void {
    this.activeProject.set(project);
    this.previewView.set('project-detail');
  }

  closeProjectDetail(): void {
    this.previewView.set('portfolio');
    this.activeProject.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscKey(): void {
    if (this.fullPreview()) { this.fullPreview.set(false); this.closeProjectDetail(); }
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

  getStats(): { projects: number; skills: number; experience: number; completionRate: number } {
    return {
      projects:       this.projects().length,
      skills:         this.skills().length,
      experience:     this.experiences().length,
      completionRate: Math.round(
        this.projects().reduce((acc, p) => acc + p.pct, 0) /
        (this.projects().length || 1)
      ),
    };
  }

  async exportPortfolio(): Promise<void> {
    const data = {
      projects:   this.projects(),
      skills:     this.skills(),
      formations: this.formations(),
      exportedAt: new Date().toISOString(),
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