import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioService } from '../../portfolio';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-vue-ensemble',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vue-ensemble.html',
  styleUrl: './vue-ensemble.css'
})
export class VueEnsemble {
  private portfolio = inject(PortfolioService);
  private auth = inject(AuthService);

  readonly projects = this.portfolio.projects;
  readonly skills = this.portfolio.skills;
  readonly messages = this.portfolio.messages;
  readonly unreadCount = this.portfolio.unreadCount;

  readonly currentUser = this.auth.currentUser;

  readonly completedProjects = computed(() =>
    this.projects().filter(p => p.pct === 100).length
  );

  readonly topSkills = computed(() =>
    [...this.skills()].sort((a, b) => b.pct - a.pct).slice(0, 4)
  );
}
