import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PortfolioService } from '../../portfolio';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private portfolio = inject(PortfolioService);

  readonly project = computed(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';  // string directement
    return this.portfolio.projects().find(p => p.id === id) ?? null;
  });

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
