import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../data/user';
import { PortfolioService } from '../../data/portfolio';

@Component({
  selector: 'app-vue-ensemble',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vue-ensemble.html',
  styleUrl: './vue-ensemble.css',
})
export class VueEnsemble {

  private userSvc      = inject(UserService);
  private portfolioSvc = inject(PortfolioService);
  private router       = inject(Router);

  readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  readonly user = computed(() => {
    const u = this.userSvc.currentUser();
    const p = this.userSvc.myProfile();
    return {
      name:     u ? `${u.prenom} ${u.nom}`.trim() : '',
      initials: u ? `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase() : '',
      avatar:   p?.avatar || null,
    };
  });

  readonly avatarPreview = computed(() => this.userSvc.myProfile()?.avatar || null);

  readonly skills   = this.portfolioSvc.mySkills;
  readonly projects = this.portfolioSvc.myProjects;

  readonly stats = computed(() => [
    { label: 'Projets réalisés', value: String(this.portfolioSvc.myProjects().length) },
    { label: 'Compétences',      value: String(this.portfolioSvc.mySkills().length) },
    { label: 'Messages non lus', value: String(this.portfolioSvc.unreadCount()) },
  ]);

  /**
   * Navigue vers /dashboard/cv et déclenche downloadCV()
   * qui ouvre une NOUVELLE FENÊTRE contenant uniquement le .cv-paper,
   * puis lance l'impression de cette fenêtre propre.
   */
  generateCV(): void {
    this.router.navigate(['/dashboard/cv']).then(() => {
      // Attendre qu'Angular ait rendu la page CV
      setTimeout(() => {
        // Chercher le composant CV via son bouton downloadCV
        const btn = document.querySelector<HTMLButtonElement>('.cv-dl-btn');
        if (btn) {
          btn.click();   // déclenche downloadCV() du composant CV
        }
      }, 600);
    });
  }

  triggerAvatarUpload(): void {
    (document.getElementById('avatar-upload') as HTMLInputElement)?.click();
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.userSvc.updateMyProfile({ avatar: reader.result as string });
    };
    reader.readAsDataURL(input.files[0]);
  }
}