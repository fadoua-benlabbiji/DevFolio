import { Component, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../data/user';
import { PortfolioService } from '../../data/portfolio';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv.html',
  styleUrl: './cv.css',
})
export class CV implements AfterViewInit {

  private userSvc      = inject(UserService);
  private portfolioSvc = inject(PortfolioService);

  readonly profile     = this.userSvc.myProfile;
  readonly educations  = this.userSvc.myEducations;
  readonly languages   = this.userSvc.myLanguages;

  readonly projects    = this.portfolioSvc.myProjects;
  readonly skills      = this.portfolioSvc.mySkills;
  readonly experiences = this.portfolioSvc.myExperiences;

  readonly fullName = computed(() => {
    const u = this.userSvc.currentUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  });

  readonly email = computed(() =>
    this.userSvc.currentUser()?.email ?? ''
  );

  // Tous les projets pour le CV (avec sécurisation technologies)
  readonly allProjects = computed(() =>
    this.projects().map(p => ({ ...p, technologies: p.technologies ?? [] }))
  );

  // Top 3 projets : terminés d'abord, puis en cours
  readonly topProjects = computed(() => {
    const all = this.allProjects();
    return [...all.filter(p => p.pct === 100), ...all.filter(p => p.pct < 100)].slice(0, 3);
  });

  accentColor  = signal('#2563eb');
  downloading  = signal(false);
  downloaded   = signal(false);

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

  ngAfterViewInit(): void {}

  setColor(color: string): void { this.accentColor.set(color); }

  async downloadCV(): Promise<void> {
    this.downloading.set(true);

    // Récupérer UNIQUEMENT le .cv-paper
    const cvEl = document.querySelector('.cv-paper') as HTMLElement;
    if (!cvEl) { this.downloading.set(false); return; }

    const clone = cvEl.cloneNode(true) as HTMLElement;
    const accent = this.accentColor();

    // Remplacer les var(--accent) par la vraie couleur
    this.resolveAccentVar(clone, accent);

    // Inliner les images base64
    await this.inlineImages(clone);

    // Inliner aussi les styles calculés de la sidebar (background dark)
    this.inlineComputedStyles(cvEl, clone);

    const html = this.buildPrintHTML(clone.outerHTML, accent);

    const printWindow = window.open('', '_blank', 'width=900,height=700');
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

  private resolveAccentVar(el: HTMLElement, accent: string): void {
    el.querySelectorAll<HTMLElement>('[style]').forEach(node => {
      node.style.cssText = node.style.cssText.replace(/var\(--accent\)/g, accent);
    });
  }

  /** Inline critical computed styles (background colors) from source to clone */
  private inlineComputedStyles(source: HTMLElement, clone: HTMLElement): void {
    const sourceEls = Array.from(source.querySelectorAll<HTMLElement>('*'));
    const cloneEls  = Array.from(clone.querySelectorAll<HTMLElement>('*'));
    sourceEls.forEach((el, i) => {
      if (!cloneEls[i]) return;
      const cs = window.getComputedStyle(el);
      // Forcer background et color pour les éléments clés
      const bg = cs.backgroundColor;
      const color = cs.color;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        cloneEls[i].style.backgroundColor = bg;
      }
      if (color) {
        cloneEls[i].style.color = color;
      }
    });
  }

  private async inlineImages(el: HTMLElement): Promise<void> {
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(imgs.map(img => new Promise<void>(resolve => {
      if (!img.src || img.src.startsWith('data:')) { resolve(); return; }
      const canvas = document.createElement('canvas');
      const image  = new Image();
      image.crossOrigin = 'anonymous';
      image.onload  = () => {
        canvas.width  = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d')!.drawImage(image, 0, 0);
        img.src = canvas.toDataURL('image/png');
        resolve();
      };
      image.onerror = () => resolve();
      image.src = img.src;
    })));
  }

  private buildPrintHTML(body: string, accent: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      background: white;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-size: 11.5px;
      line-height: 1.55;
      color: #1f2937;
    }

    :root { --accent: ${accent}; }

    /* CV Paper — layout A4 */
    .cv-paper {
      --accent: ${accent};
      --sidebar-bg: #111827;
      display: grid;
      grid-template-columns: 240px 1fr;
      width: 210mm;
      min-height: 297mm;
      background: #fff;
    }

    /* SIDEBAR */
    .cv-sidebar {
      background: #111827 !important;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .cv-sidebar::before {
      content: '';
      position: absolute;
      top: -60px; left: -60px;
      width: 220px; height: 220px;
      background: ${accent};
      opacity: 0.18;
      border-radius: 50%;
    }
    .cv-sidebar__identity {
      display: flex; flex-direction: column; align-items: center;
      padding: 44px 20px 28px; text-align: center; position: relative; z-index: 1;
    }
    .cv-avatar-wrap {
      width: 88px; height: 88px; border-radius: 50%;
      background: linear-gradient(135deg, ${accent}, rgba(255,255,255,0.25));
      padding: 3px; margin-bottom: 16px;
    }
    .cv-avatar {
      width: 100%; height: 100%; border-radius: 50%;
      object-fit: cover; background: #fff;
    }
    .cv-avatar--initials {
      background: ${accent}; color: #fff; display: flex;
      align-items: center; justify-content: center;
      font-weight: 700; font-size: 28px; width: 100%; height: 100%; border-radius: 50%;
    }
    .cv-sid-name {
      font-family: 'DM Serif Display', serif; font-size: 17px;
      font-weight: 600; color: #fff !important; margin: 0 0 6px; line-height: 1.3;
    }
    .cv-sid-titre {
      font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: ${accent} !important;
    }
    .cv-sid-section {
      padding: 18px 20px;
      border-top: 1px solid rgba(255,255,255,0.07);
      position: relative; z-index: 1;
    }
    .cv-sid-section__title {
      font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em;
      text-transform: uppercase; color: ${accent} !important;
      margin: 0 0 12px; display: flex; align-items: center; gap: 7px;
    }
    .cv-sid-section__dash {
      display: inline-block; width: 16px; height: 2px; background: ${accent};
    }
    .cv-contact-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 9px; }
    .cv-contact-list li {
      display: flex; align-items: flex-start; gap: 8px;
      font-size: 10.5px; color: rgba(255,255,255,0.78) !important; line-height: 1.4; word-break: break-word;
    }
    .cv-contact-icon { flex-shrink: 0; display: inline-flex; align-items: center; color: ${accent} !important; min-width: 14px; margin-top: 1px; }
    .cv-contact-link { word-break: break-all; flex: 1; }
    .cv-skills-list  { display: flex; flex-direction: column; gap: 11px; }
    .cv-skill-row    { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .cv-skill-name   { font-size: 10.5px; font-weight: 500; color: rgba(255,255,255,0.82) !important; }
    .cv-skill-pct    { font-size: 9.5px; color: rgba(255,255,255,0.45) !important; }
    .cv-skill-track  { height: 3px; background: rgba(255,255,255,0.1) !important; border-radius: 2px; overflow: hidden; }
    .cv-skill-fill   { height: 100%; border-radius: 2px; }
    .cv-lang-list    { display: flex; flex-direction: column; gap: 8px; }
    .cv-lang-item    { display: flex; justify-content: space-between; align-items: center; }
    .cv-lang-name    { font-size: 10.5px; color: rgba(255,255,255,0.82) !important; font-weight: 500; }
    .cv-lang-badge   {
      font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
      background: rgba(255,255,255,0.1) !important; color: ${accent} !important; letter-spacing: 0.04em;
    }

    /* MAIN */
    .cv-main {
      padding: 40px 36px 36px; display: flex; flex-direction: column; gap: 26px; background: #fff !important;
    }
    .cv-bio {
      padding: 14px 18px; border-left: 3px solid ${accent};
      background: #f8f9ff !important; border-radius: 0 8px 8px 0;
    }
    .cv-bio__text { font-size: 12px; color: #374151 !important; line-height: 1.7; font-style: italic; }
    .cv-section__title {
      display: flex; align-items: center; gap: 10px;
      font-family: 'DM Serif Display', serif; font-size: 15px; font-weight: 600;
      color: #111827 !important; margin: 0 0 16px; padding-bottom: 8px;
      border-bottom: 1.5px solid #e5e7eb;
    }
    .cv-section__title svg { flex-shrink: 0; color: ${accent} !important; stroke: ${accent} !important; }
    .cv-timeline         { display: flex; flex-direction: column; gap: 18px; }
    .cv-timeline-item    { display: flex; gap: 14px; position: relative; }
    .cv-timeline-dot     { flex-shrink: 0; width: 9px; height: 9px; border-radius: 50%; background: ${accent} !important; margin-top: 5px; }
    .cv-timeline-item::before {
      content: ''; position: absolute; left: 4px; top: 18px; bottom: -18px;
      width: 1px; background: #e5e7eb !important;
    }
    .cv-timeline-item:last-child::before { display: none; }
    .cv-timeline-header  { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
    .cv-timeline-role    { font-size: 13px; font-weight: 700; color: #111827 !important; }
    .cv-timeline-date    { font-size: 10px; color: #9ca3af !important; font-weight: 500; }
    .cv-timeline-company { font-size: 11.5px; font-weight: 600; color: ${accent} !important; display: block; margin-bottom: 5px; }
    .cv-timeline-desc    { font-size: 11px; color: #6b7280 !important; line-height: 1.5; }
    .cv-projects-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 12px; }
    .cv-project-card     { border: 1px solid #e5e7eb !important; border-radius: 10px; overflow: hidden; background: #fff !important; }
    .cv-project-card__top { height: 3px; }
    .cv-project-card__body { padding: 13px 14px; }
    .cv-project-name     { font-size: 12.5px; font-weight: 700; color: #111827 !important; margin: 0 0 4px; }
    .cv-project-stack    { font-size: 10px; color: ${accent} !important; font-weight: 600; margin: 0 0 6px; }
    .cv-project-desc     { font-size: 10.5px; color: #6b7280 !important; line-height: 1.45; }

    @page  { size: A4; margin: 0; }
    @media print {
      html, body { margin: 0; padding: 0; }
      .cv-paper  { width: 210mm; min-height: 297mm; }
    }
  </style>
</head>
<body>${body}</body>
</html>`;
  }
}