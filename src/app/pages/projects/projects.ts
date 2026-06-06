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

  // ← myProjects filtre automatiquement par userId de l'utilisateur connecté
  readonly projects = this.portfolio.myProjects;

  showForm = signal(false);
  editingId = signal<number | null>(null);

  form: Omit<Project, 'id'> = this.emptyForm();

  private emptyForm(): Omit<Project, 'id'> {
    return {
      userId: 0, // ← sera écrasé par addProject() avec l'id du user connecté
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
      userId: p.userId,
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

  cancel(): void {
    this.showForm.set(false);
  }

  viewProject(projectId: number): void {
    this.router.navigate(['/dashboard/project-detail', projectId]);
  }

  onLogoError(project: Project): void {
    this.portfolio.updateProject(project.id, { ...project, logo: '' });
    console.warn(`Logo introuvable pour: ${project.name}`);
  }

  onLogoUpload(event: Event, project: Project): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.portfolio.updateProject(project.id, { ...project, logo: reader.result as string });
    };
    reader.readAsDataURL(input.files[0]);
  }

  get completedCount(): number { return this.projects().filter(p => p.pct === 100).length; }
  get inProgressCount(): number { return this.projects().filter(p => p.pct < 100).length; }
}