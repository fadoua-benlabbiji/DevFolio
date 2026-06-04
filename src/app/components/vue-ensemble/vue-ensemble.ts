import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../user';             // ← ajustez le chemin
import { ProfileService } from '../../profile'; // ← ajustez le chemin

@Component({
  selector: 'app-vue-ensemble',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vue-ensemble.html',
  styleUrl: './vue-ensemble.css',
})
export class VueEnsemble implements OnInit {
  today = '';
user: { name: string; initials: string; avatar: string | null } = {
  name: '',
  initials: '',
  avatar: null,
};

  skills: { name: string; pct: number; color: string }[] = [];
  projects: { name: string; stack: string; pct: number; color: string }[] = [];
  stats: { label: string; value: string }[] = [];

  constructor(
    private userService: UserService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // Date
    this.today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    // User courant
    const u = this.userService.currentUser();
    const profile = u ? this.profileService.getById(u.profileId) : null;

this.user = {
  name: `${u?.prenom ?? ''} ${u?.nom ?? ''}`.trim(),
  initials: `${u?.prenom?.charAt(0) ?? ''}${u?.nom?.charAt(0) ?? ''}`.toUpperCase(),
  avatar: profile?.avatar || null,
};

    // Compétences depuis le profil
    this.skills = (profile?.skills ?? []).map((name, i) => ({
      name,
      pct: [92, 88, 75, 70, 65, 58, 72, 60][i % 8],
      color: ['#F5C518','#3b82f6','#22c55e','#60a5fa','#a78bfa','#fb923c','#e879f9','#34d399'][i % 8],
    }));

    // Stats depuis le profil
    this.stats = [
      { label: 'Projets réalisés', value: String(profile?.projets ?? 0) },
      { label: 'Compétences',      value: String(profile?.skills?.length ?? 0) },
      { label: 'Messages non lus', value: '1' },
    ];

    // Projets (mock enrichi, à remplacer par un ProjectService plus tard)
    this.projects = [
      { name: 'E-commerce Platform', stack: 'Angular · Node.js · MongoDB', pct: 100, color: '#F5C518' },
      { name: 'Analytics Dashboard', stack: 'React · TypeScript · D3',      pct: 100, color: '#3b82f6' },
      { name: 'Auth Microservice',   stack: 'NestJS · PostgreSQL · JWT',     pct: 78,  color: '#a78bfa' },
      { name: 'Portfolio V2',        stack: 'Angular · SCSS · Firebase',     pct: 100, color: '#22c55e' },
      { name: 'Chat App',            stack: 'React · Socket.io · Redis',     pct: 45,  color: '#fb923c' },
      { name: 'API Gateway',         stack: 'NestJS · Docker · AWS',         pct: 100, color: '#e879f9' },
    ];
  }
}