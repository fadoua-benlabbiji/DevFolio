import { Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../data/user';
import { PortfolioService } from '../../data/portfolio';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  badgeFn?: () => number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {

  private userSvc      = inject(UserService);
  private portfolioSvc = inject(PortfolioService);
  private sanitizer    = inject(DomSanitizer);
  private router       = inject(Router);

  readonly user = computed(() => {
    const u = this.userSvc.currentUser();
    const p = this.userSvc.myProfile();
    return {
      name:     u ? `${u.prenom} ${u.nom}`.trim() : '',
      username: p?.username ? `@${p.username}` : `@${u?.prenom?.toLowerCase() ?? ''}`,
      email:    u?.email ?? '',
      avatar:   p?.avatar || null,
      initials: u ? `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase() : '',
    };
  });

  isActive(route: string): boolean {
    const url = this.router.url;
    if (route === '/dashboard/projects') {
      return url.startsWith('/dashboard/projects') || url.startsWith('/dashboard/project-detail');
    }
    return url.startsWith(route);
  }

  readonly navItems: NavItem[] = [
    { icon: 'grid',      label: "Vue d'ensemble", route: '/dashboard/vue-ensemble' },
    { icon: 'folder',    label: 'Projets',         route: '/dashboard/projects' },
    { icon: 'wrench',    label: 'Compétences',     route: '/dashboard/skills' },
    { icon: 'mail',      label: 'Messages',        route: '/dashboard/messages',
      badgeFn: () => this.portfolioSvc.unreadCount() },
    { icon: 'file-text', label: 'Générer CV',      route: '/dashboard/cv' },
    { icon: 'globe',     label: 'Mon DevFolio',    route: '/dashboard/devfolio' },
    { icon: 'settings',  label: 'Paramètres',      route: '/dashboard/settings' },
  ];

  logout(): void {
    this.userSvc.logout();
    this.router.navigate(['/']);
  }

  getIcon(name: string): SafeHtml {
    const icons: Record<string, string> = {
      grid:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
      folder:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
      wrench:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      mail:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
      'file-text': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
      globe:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      settings:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    };
    return this.sanitizer.bypassSecurityTrustHtml(icons[name] ?? '');
  }
}
