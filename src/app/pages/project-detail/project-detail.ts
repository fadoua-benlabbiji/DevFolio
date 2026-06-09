import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PortfolioService, Project } from '../../data/portfolio';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private portfolio = inject(PortfolioService);

  project: Project | null = null;
  projectId: number | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = parseInt(id, 10);
        this.loadProject();
      }
    });
  }

  private loadProject(): void {
    if (this.projectId !== null) {
      const projects = this.portfolio.myProjects(); // ← myProjects
      this.project = projects.find((p: Project) => p.id === this.projectId) || null; // ← type
      if (!this.project) {
        this.router.navigate(['/projects']);
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/projects']);
  }

  get progressStatus(): string {
    if (!this.project) return '';
    if (this.project.pct === 100) return 'Terminé';
    if (this.project.pct >= 75) return 'Phase finale';
    if (this.project.pct >= 50) return 'En cours';
    return 'Démarré';
  }
}
