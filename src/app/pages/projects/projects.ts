import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortfolioService, Project } from'../../data/portfolio';
import { TronquerPipe } from '../../tronquer-pipe';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, TronquerPipe],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects {
  private portfolio = inject(PortfolioService);
  private router    = inject(Router);

  readonly projects = this.portfolio.myProjects;

  showForm     = signal(false);
  editingId    = signal<number | null>(null);
  activeFilter = signal<'tous' | 'termine' | 'encours'>('tous');

  // ✅ champ intermédiaire pour features (textarea → string)
  featuresText = '';

  get filteredProjects(): Project[] {
    const f = this.activeFilter();
    if (f === 'termine') return this.projects().filter(p => p.pct === 100);
    if (f === 'encours') return this.projects().filter(p => p.pct < 100);
    return this.projects();
  }

  form: Omit<Project, 'id'> = this.emptyForm();

  private emptyForm(): Omit<Project, 'id'> {
    return {
      userId: 0, name: '', pct: 0, color: '#F5C518',
      description: '', readme: '', logo: '', github: '', demo: '',
      startDate: '', endDate: '', role: '',
      technologies: [], features: [], images: [], impact: ''
    };
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.featuresText = '';          // ✅
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEdit(p: Project): void {
    this.form = {
      userId: p.userId, name: p.name, pct: p.pct, color: p.color,
      description: p.description, readme: p.readme ?? '', logo: p.logo ?? '',
      github: p.github ?? '', demo: p.demo ?? '', startDate: p.startDate ?? '',
      endDate: p.endDate ?? '', role: p.role ?? '',
      technologies: p.technologies ?? [], features: p.features ?? [],
      images: p.images ?? [], impact: p.impact ?? ''
    };
    this.featuresText = p.features?.join('\n') ?? '';   // ✅
    this.editingId.set(p.id);
    this.showForm.set(true);
  }

  save(): void {
    // ✅ convertir featuresText → tableau avant sauvegarde
    this.form.features = this.featuresText
      .split('\n')
      .map(l => l.replace(/^-\s*/, '').trim())
      .filter(l => l !== '');

    const id = this.editingId();
    if (id !== null) {
      this.portfolio.updateProject(id, this.form);
    } else {
      this.portfolio.addProject(this.form);
    }
    this.showForm.set(false);
  }

  delete(id: number): void {
    if (confirm('Supprimer ce projet ?')) this.portfolio.removeProject(id);
  }

  cancel(): void { this.showForm.set(false); }

  viewProject(id: number): void {
    this.router.navigate(['/dashboard/project-detail', id]);
  }

  onLogoError(project: Project): void {
    this.portfolio.updateProject(project.id, { ...project, logo: '' });
  }

  onLogoUpload(event: Event, project: Project): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.portfolio.updateProject(project.id, { ...project, logo: reader.result as string });
    };
    reader.readAsDataURL(input.files[0]);
  }

  get completedCount(): number { return this.projects().filter(p => p.pct === 100).length; }
  get inProgressCount(): number { return this.projects().filter(p => p.pct < 100).length; }
}