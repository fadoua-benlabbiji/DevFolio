import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../data/user';
import { PortfolioService } from '../../data/portfolio';
import { TronquerPipe } from '../../tronquer-pipe';

@Component({
  selector: 'app-vue-ensemble',
  standalone: true,
  imports: [CommonModule, RouterModule,TronquerPipe],
  templateUrl: './vue-ensemble.html',
  styleUrl: './vue-ensemble.css',
})
export class VueEnsemble {

  private userSvc      = inject(UserService);
  private portfolioSvc = inject(PortfolioService);
  private router       = inject(Router);

  public user = computed(() => {
    const u = this.userSvc.currentUser();
    const p = this.userSvc.myProfile();
    return {
      name:     u ? `${u.prenom} ${u.nom}` : '',
      avatar:   p?.avatar || null,
    };
  });

  public avatarPreview = computed(() => this.userSvc.myProfile()?.avatar || null);

  public skills   = this.portfolioSvc.mySkills;
  public projects = this.portfolioSvc.myProjects;
  public stats = computed(() => [
    { label: 'Projets réalisés', value: String(this.portfolioSvc.myProjects().length) },
    { label: 'Compétences',      value: String(this.portfolioSvc.mySkills().length) },
    { label: 'Messages non lus', value: String(this.portfolioSvc.unreadCount()) },
  ]);

  generateCV(): void {
    //changement de page
    this.router.navigate(['/dashboard/cv']).then(() => {
      
      setTimeout(() => {
     
        const btn = document.querySelector<HTMLButtonElement>('.cv-dl-btn');
        if (btn) {
          btn.click();   //simuler clique sur le button
        }
      }, 600);
    });
  }

  activerInput(): void {
    (document.getElementById('avatar-upload') as HTMLInputElement)?.click();
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement; // event.target=element declencheur
    if (!input.files?.length) return;  //aucun fichier selectionne
    const reader = new FileReader();  //objet reader
    reader.onload = () => {       //apres lecture
      this.userSvc.updateMyProfile({ avatar: reader.result as string });
    };
    reader.readAsDataURL(input.files[0]); //lecture de fichier
  }
}