import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.html',
  styleUrl: './parametres.css'
})
export class Parametres {
  private auth = inject(AuthService);
  readonly currentUser = this.auth.currentUser;

  saved = signal(false);
  activeTab = signal<'profil' | 'apparence' | 'confidentialite' | 'notifications'>('profil');

  // Apparence
  themeMode = signal<'light' | 'dark' | 'system'>('light');
  accentColor = signal('#F5C518');
  compactMode = signal(false);
  animationsEnabled = signal(true);

  // Confidentialité
  profileVisibility = signal<'public' | 'private' | 'connections'>('public');
  showEmail = signal(false);
  showGithub = signal(true);
  indexSearchEngines = signal(true);

  // Notifications
  emailNotifs = signal(true);
  messageNotifs = signal(true);
  weeklyDigest = signal(false);
  projectViews = signal(true);

  readonly accentColors = [
    '#F5C518', '#3b82f6', '#22c55e', '#9333ea', '#ef4444', '#f97316', '#06b6d4', '#111827'
  ];

  readonly tabs = [
    { id: 'profil',          label: 'Profil',          icon: 'user' },
    { id: 'confidentialite', label: 'Confidentialité', icon: 'shield' },
    { id: 'notifications',   label: 'Notifications',   icon: 'bell' },
  ] as const;

  readonly profileCompleteness = computed(() => {
    const u = this.currentUser();
    if (!u) return 0;
    let score = 0;
    if (u.prenom) score += 20;
    if (u.nom) score += 20;
    if (u.email) score += 20;
    if (u.username) score += 20;
    if (u.avatar) score += 20;
    return score;
  });

  setTab(tab: 'profil' | 'confidentialite' | 'notifications'): void {
    this.activeTab.set(tab);
  }

  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}