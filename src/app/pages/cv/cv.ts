import { Component, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../data/auth';
import { PortfolioService } from '../../data/portfolio';
import { UserService } from '../../data/user';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../data/profile';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv.html',
  styleUrl: './cv.css'
})
export class CV implements AfterViewInit {
  private auth      = inject(AuthService);
  private portfolio = inject(PortfolioService);
  private userSvc   = inject(UserService);
  private route     = inject(ActivatedRoute);
 private profileSvc = inject(ProfileService);
  // ── Données utilisateur ───────────────────────────────────────────────────
  readonly user     = this.auth.currentUser;
  readonly projects = this.portfolio.myProjects;
  readonly skills   = this.portfolio.mySkills;
  readonly experiences = this.portfolio.myExperiences;

  // ── Infos profil (email, location, github, linkedin depuis PortfolioProfile) ─
  readonly profile  = this.portfolio.myProfile;

  accentColor = signal('#2563eb');
  downloading = signal(false);
  downloaded  = signal(false);

  readonly colorOptions = [
    { value: '#2563eb', label: 'Bleu Saphir' },
    { value: '#16a34a', label: 'Vert Émeraude' },
    { value: '#9333ea', label: 'Violet Royal' },
    { value: '#dc2626', label: 'Rouge Rubis' },
    { value: '#0891b2', label: 'Cyan Électrique' },
    { value: '#ea580c', label: 'Orange Feu' },
    { value: '#111827', label: 'Noir Graphite' },
    { value: '#0d9488', label: 'Teal Pro' },
  ];

  // ── Top 3 projets terminés ────────────────────────────────────────────────
  readonly topProjects = computed(() =>
    this.projects().filter(p => p.pct === 100).slice(0, 3)
  );

  // ── Nom complet ───────────────────────────────────────────────────────────
  readonly fullName = computed(() => {
    const u = this.userSvc.currentUser();
    if (!u) return '';
    return `${u.prenom} ${u.nom}`;
  });

  // ── Avatar (AuthService) ──────────────────────────────────────────────────
readonly avatar = computed(() => {
  const u = this.userSvc.currentUser();
  if (!u) return '';
  const profile = this.profileSvc.getById(u.profileId);
  return profile?.avatar || '';
});

  // ── Email (UserService) ───────────────────────────────────────────────────
  readonly email = computed(() => this.userSvc.currentUser()?.email ?? '');

  setColor(color: string): void {
    this.accentColor.set(color);
  }

  // ─── Téléchargement ───────────────────────────────────────────────────────
  async downloadCV(): Promise<void> {
    this.downloading.set(true);

    const cvEl = document.querySelector('.cv-paper') as HTMLElement;
    if (!cvEl) { this.downloading.set(false); return; }

    const clone = cvEl.cloneNode(true) as HTMLElement;
    const accent = this.accentColor();
    this.resolveAccentVar(clone, accent);
    await this.inlineImages(clone);
    const html = this.buildPrintHTML(clone.outerHTML, accent);

    const printWindow = window.open('', '_blank');
    if (!printWindow) { this.downloading.set(false); return; }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        this.downloading.set(false);
        this.downloaded.set(true);
        setTimeout(() => this.downloaded.set(false), 3000);
      }, 600);
    };
  }

  private resolveAccentVar(root: HTMLElement, accent: string): void {
    root.querySelectorAll<HTMLElement>('*').forEach(el => {
      const style = el.getAttribute('style') ?? '';
      if (style.includes('var(--accent)'))
        el.setAttribute('style', style.replaceAll('var(--accent)', accent));
    });
    const rootStyle = root.getAttribute('style') ?? '';
    root.setAttribute('style',
      `--accent:${accent};--sidebar-bg:#111827;--sidebar-text:rgba(255,255,255,0.85);--sidebar-muted:rgba(255,255,255,0.45);${rootStyle}`
    );
  }

  private async inlineImages(root: HTMLElement): Promise<void> {
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(imgs.map(img => new Promise<void>(resolve => {
      const src = img.src;
      if (!src || src.startsWith('data:')) { resolve(); return; }
      const canvas = document.createElement('canvas');
      const image  = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        canvas.width  = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d')!.drawImage(image, 0, 0);
        img.src = canvas.toDataURL('image/png');
        resolve();
      };
      image.onerror = () => resolve();
      image.src = src;
    })));
  }

  private buildPrintHTML(cvHTML: string, accent: string): string {
    const accentLight   = this.hexToRgba(accent, 0.08);
    const accentBadge   = this.hexToRgba(accent, 0.12);

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CV — ${this.fullName()}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .cv-paper { --accent: ${accent}; --sidebar-bg: #111827; display: grid; grid-template-columns: 220px 1fr; width: 100%; max-width: 860px; min-height: 1100px; background: #fff; font-family: 'DM Sans', sans-serif; margin: 0 auto; }
    .cv-sidebar { background: #111827; display: flex; flex-direction: column; position: relative; overflow: hidden; }
    .cv-sidebar::before { content: ''; position: absolute; top: -40px; left: -40px; width: 200px; height: 200px; background: ${accent}; opacity: 0.18; border-radius: 50%; }
    .cv-sidebar::after  { content: ''; position: absolute; bottom: 60px; right: -50px; width: 140px; height: 140px; background: ${accent}; opacity: 0.1; border-radius: 50%; }
    .cv-sidebar__top { display: flex; flex-direction: column; align-items: center; padding: 36px 20px 24px; text-align: center; position: relative; z-index: 1; }
    .cv-avatar-ring { width: 84px; height: 84px; border-radius: 50%; padding: 3px; background: linear-gradient(135deg, ${accent}, rgba(255,255,255,0.3)); margin-bottom: 14px; }
    .cv-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid #111827; display: block; }
    .cv-name { font-family: 'DM Serif Display', serif; font-size: 18px; color: #fff; margin: 0 0 6px; line-height: 1.2; }
    .cv-titre { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${accent}; margin: 0; }
    .cv-section-side { padding: 18px 20px; border-top: 1px solid rgba(255,255,255,0.07); position: relative; z-index: 1; }
    .cv-section-side__title { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: ${accent}; margin: 0 0 12px; }
    .cv-contact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .cv-contact-list li { display: flex; align-items: center; gap: 8px; font-size: 11px; color: rgba(255,255,255,0.85); word-break: break-all; }
    .cv-contact-icon { flex-shrink: 0; display: flex; align-items: center; color: ${accent}; }
    .cv-skills-list { display: flex; flex-direction: column; gap: 9px; }
    .cv-skill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .cv-skill-name { font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 500; }
    .cv-skill-pct { font-size: 10px; color: rgba(255,255,255,0.45); }
    .cv-skill-bar { height: 3px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; }
    .cv-skill-fill { height: 100%; background: ${accent}; border-radius: 2px; }
    .cv-formation-item { display: flex; gap: 10px; margin-bottom: 10px; }
    .cv-formation-annee { font-size: 10px; font-weight: 700; color: ${accent}; min-width: 32px; padding-top: 1px; }
    .cv-formation-diplome { font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 600; margin: 0 0 2px; }
    .cv-formation-etab { font-size: 10px; color: rgba(255,255,255,0.45); margin: 0; }
    .cv-main { padding: 36px 32px; display: flex; flex-direction: column; gap: 28px; background: #fff; }
    .cv-bio { padding: 16px 20px; background: ${accentLight}; border-left: 3px solid ${accent}; border-radius: 0 8px 8px 0; }
    .cv-bio p { font-size: 13px; color: #374151; line-height: 1.6; margin: 0; font-style: italic; }
    .cv-section-main__title { display: flex; align-items: center; gap: 10px; font-family: 'DM Serif Display', serif; font-size: 15px; color: #111; margin: 0 0 16px; }
    .cv-section-main__line { flex: 1; height: 1px; background: ${accent}; opacity: 0.25; }
    .cv-section-main__title .cv-section-main__line:first-child { flex: 0.1; background: ${accent}; opacity: 1; height: 2px; border-radius: 1px; }
    .cv-exp-item { margin-bottom: 16px; padding-left: 14px; border-left: 2px solid #e5e7eb; position: relative; }
    .cv-exp-item::before { content: ''; position: absolute; left: -5px; top: 5px; width: 8px; height: 8px; border-radius: 50%; background: ${accent}; }
    .cv-exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .cv-exp-poste { font-size: 13px; font-weight: 700; color: #111; margin: 0; }
    .cv-exp-ent { color: ${accent}; font-weight: 600; }
    .cv-exp-periode { font-size: 11px; color: #9ca3af; margin: 2px 0 6px; }
    .cv-exp-desc { font-size: 12px; color: #4b5563; line-height: 1.5; margin: 0; }
    .cv-projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .cv-project-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; position: relative; overflow: hidden; }
    .cv-project-card__accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 10px 10px 0 0; }
    .cv-project-name { font-size: 12px; font-weight: 700; color: #111; margin: 8px 0 3px; }
    .cv-project-stack { font-size: 10px; color: ${accent}; font-weight: 600; margin: 0 0 5px; }
    .cv-project-desc { font-size: 11px; color: #6b7280; margin: 0; line-height: 1.4; }
    .cv-langues { display: flex; gap: 12px; flex-wrap: wrap; }
    .cv-langue-item { display: flex; align-items: center; gap: 8px; }
    .cv-langue-name { font-size: 13px; font-weight: 600; color: #111; }
    .cv-langue-level { font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
    .cv-langue-level--native { background: ${accentBadge}; color: ${accent}; }
    .cv-langue-level--pro { background: #f3f4f6; color: #6b7280; }
    @page { size: A4; margin: 8mm; }
    @media print { body { margin: 0; } .cv-paper { box-shadow: none; border-radius: 0; max-width: 100%; } }
  </style>
</head>
<body>${cvHTML}</body>
</html>`;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  ngAfterViewInit(): void {
    const auto = this.route.snapshot.queryParamMap.get('auto');
    if (auto === 'download') setTimeout(() => this.downloadCV(), 1000);
  }
}