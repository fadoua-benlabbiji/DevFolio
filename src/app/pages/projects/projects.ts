import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortfolioService, Project } from '../../portfolio';
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
  private router = inject(Router);
  readonly projects = this.portfolio.projects;

  showForm = signal(false);
  editingId = signal<number | null>(null);

  form: Omit<Project, 'id'> = this.emptyForm();

  private emptyForm(): Omit<Project, 'id'> {
    return {
      name: '',
      stack: '',
      pct: 0,
      color: '#F5C518',
      description: '',
      readme: '',
      logo: '',
      github: '',
      demo: '',
      startDate: '',
      endDate: '',
      role: '',
      technologies: [],
      features: [],
      images: [],
      impact: ''
    };
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEdit(p: Project): void {
    this.form = {
      name: p.name,
      stack: p.stack,
      pct: p.pct,
      color: p.color,
      description: p.description,
      readme: p.readme ?? '',
      logo: p.logo ?? '',
      github: p.github ?? '',
      demo: p.demo ?? '',
      startDate: p.startDate ?? '',
      endDate: p.endDate ?? '',
      role: p.role ?? '',
      technologies: p.technologies ?? [],
      features: p.features ?? [],
      images: p.images ?? [],
      impact: p.impact ?? ''
    };
    this.editingId.set(p.id);
    this.showForm.set(true);
  }

  save(): void {
    const id = this.editingId();
    if (id !== null) {
      this.portfolio.updateProject(id, this.form);
    } else {
      this.portfolio.addProject(this.form);
    }
    this.showForm.set(false);
  }

  delete(id: number): void {
    if (confirm('Supprimer ce projet ?')) this.portfolio.deleteProject(id);
  }

  cancel(): void { this.showForm.set(false); }

  viewProject(projectId: number): void {
    this.router.navigate(['/portfolio/projetDetail', projectId]);
  }

  /** Appelé quand l'image du modal change — met à jour form.logo */
  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 2 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.form.logo = reader.result as string;
      // Si on édite un projet existant, on met aussi à jour en direct
      const id = this.editingId();
      if (id !== null) {
        this.portfolio.updateProject(id, { logo: this.form.logo });
      }
    };
    reader.readAsDataURL(file);
    // Reset input pour permettre re-upload du même fichier
    input.value = '';
  }

  onLogoError(project: Project): void {
    this.portfolio.updateProject(project.id, { logo: '' });
  }

  get completedCount(): number { return this.projects().filter(p => p.pct === 100).length; }
  get inProgressCount(): number { return this.projects().filter(p => p.pct < 100).length; }
}