import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../user';
import { ProfileService } from '../../profile';
import { PortfolioService } from '../../portfolio';

@Component({
  selector: 'app-vue-ensemble',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vue-ensemble.html',
  styleUrl: './vue-ensemble.css',
})
export class VueEnsemble implements OnInit {
  private userService    = inject(UserService);
  private profileService = inject(ProfileService);
  private portfolio      = inject(PortfolioService);

  today = '';

  user: { name: string; initials: string; avatar: string | null } = {
    name: '', initials: '', avatar: null,
  };

  // ✅ Données réelles depuis PortfolioService
  readonly skills   = this.portfolio.mySkills;
  readonly projects = this.portfolio.myProjects;

  stats: { label: string; value: string }[] = [];

  // ── Avatar upload ────────────────────────────────────────────
  avatarPreview = signal<string | null>(null);

  ngOnInit(): void {
    this.today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const u       = this.userService.currentUser();
    const profile = u ? this.profileService.getById(u.profileId) : null;

    this.user = {
      name:     `${u?.prenom ?? ''} ${u?.nom ?? ''}`.trim(),
      initials: `${u?.prenom?.charAt(0) ?? ''}${u?.nom?.charAt(0) ?? ''}`.toUpperCase(),
      avatar:   profile?.avatar || null,
    };

    this.avatarPreview.set(this.user.avatar);

    // ✅ Stats depuis le service (valeurs dynamiques)
    this.stats = [
      { label: 'Projets réalisés', value: String(this.portfolio.myProjects().length) },
      { label: 'Compétences',      value: String(this.portfolio.mySkills().length)   },
      { label: 'Messages non lus', value: String(this.portfolio.unreadCount())       },
    ];
  }

  // ── Clic sur l'avatar → ouvre l'input file ───────────────────
  triggerAvatarUpload(): void {
    const input = document.getElementById('avatar-upload') as HTMLInputElement;
    input?.click();
  }

  // ── Lecture du fichier sélectionné ──────────────────────────
  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.avatarPreview.set(base64);
      this.user = { ...this.user, avatar: base64 };

      // ✅ Sauvegarde dans le profil si ProfileService le permet
      const u = this.userService.currentUser();
      if (u) {
        const profile = this.profileService.getById(u.profileId);
        if (profile) {
          this.profileService.update(u.profileId, { ...profile, avatar: base64 });
        }
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}