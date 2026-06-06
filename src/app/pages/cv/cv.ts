import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth';
import { PortfolioService } from '../../portfolio';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv.html',
  styleUrl: './cv.css'
})
export class CV {
  private auth = inject(AuthService);
  private portfolio = inject(PortfolioService);

  readonly user = this.auth.currentUser;
readonly projects = this.portfolio.myProjects;
readonly skills   = this.portfolio.mySkills;

  accentColor = signal('#2563eb');
  downloading = signal(false);
  downloaded = signal(false);

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

  readonly experiences = [
    {
      poste: 'Développeuse Full-Stack',
      entreprise: 'TechNova',
      periode: '2023 — présent',
      description: 'Développement d\'applications SaaS B2B avec React et Node.js.'
    },
    {
      poste: 'Développeuse Frontend',
      entreprise: 'WebStudio',
      periode: '2021 — 2023',
      description: 'Intégration d\'interfaces responsives et optimisation des performances web.'
    }
  ];

  readonly formations = [
    { diplome: 'Master Informatique',    etablissement: 'ENSIAS Rabat',         annee: '2021' },
    { diplome: 'Licence Génie Logiciel', etablissement: 'Université Hassan II',  annee: '2019' }
  ];

  setColor(color: string): void {
    this.accentColor.set(color);
  }

  readonly topProjects = computed(() =>
    this.projects().filter(p => p.pct === 100).slice(0, 3)
  );

  // ─── Téléchargement avec style complet embarqué ───────────────────────────
  async downloadCV(): Promise<void> {
    this.downloading.set(true);

    const cvEl = document.querySelector('.cv-paper') as HTMLElement;
    if (!cvEl) { this.downloading.set(false); return; }

    // 1. Clone le nœud pour ne pas toucher au DOM live
    const clone = cvEl.cloneNode(true) as HTMLElement;

    // 2. Résoudre la CSS variable --accent : remplacer chaque occurrence
    //    par la vraie valeur hex dans les style="" inline du clone
    const accent = this.accentColor();
    this.resolveAccentVar(clone, accent);

    // 3. Convertir les images en base64 pour qu'elles s'affichent hors réseau
    await this.inlineImages(clone);

    // 4. Construire le HTML complet avec le CSS entier embarqué
    const html = this.buildPrintHTML(clone.outerHTML, accent);

    // 5. Ouvrir la fenêtre et déclencher l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) { this.downloading.set(false); return; }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // Attendre le chargement des polices Google avant d'imprimer
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

  /** Parcourt tous les éléments du clone et remplace var(--accent) par la valeur hex */
  private resolveAccentVar(root: HTMLElement, accent: string): void {
    const all = root.querySelectorAll<HTMLElement>('*');
    all.forEach(el => {
      const style = el.getAttribute('style') ?? '';
      if (style.includes('var(--accent)')) {
        el.setAttribute('style', style.replaceAll('var(--accent)', accent));
      }
    });
    // Aussi sur l'élément root lui-même
    const rootStyle = root.getAttribute('style') ?? '';
    root.setAttribute('style',
      `--accent:${accent};--sidebar-bg:#111827;--sidebar-text:rgba(255,255,255,0.85);--sidebar-muted:rgba(255,255,255,0.45);${rootStyle}`
    );
  }

  /** Convertit les <img> en base64 pour éviter les images cassées à l'impression */
  private async inlineImages(root: HTMLElement): Promise<void> {
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(imgs.map(img => new Promise<void>(resolve => {
      const src = img.src;
      if (!src || src.startsWith('data:')) { resolve(); return; }
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext('2d')!.drawImage(image, 0, 0);
        img.src = canvas.toDataURL('image/png');
        resolve();
      };
      image.onerror = () => resolve(); // ignorer si erreur CORS
      image.src = src;
    })));
  }

  /** Construit le document HTML complet avec le CSS entier inline */
  private buildPrintHTML(cvHTML: string, accent: string): string {
    // Calcule quelques dérivés de la couleur accent pour les fallbacks color-mix()
    // (color-mix() n'est pas supporté partout en print)
    const accentLight = this.hexToRgba(accent, 0.08);
    const accentLighter = this.hexToRgba(accent, 0.04);
    const accentBadge = this.hexToRgba(accent, 0.12);

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CV — ${this.user()?.prenom ?? ''} ${this.user()?.nom ?? ''}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ── Reset ── */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    /* ── CV Paper ── */
    .cv-paper {
      --accent: ${accent};
      --sidebar-bg: #111827;
      --sidebar-text: rgba(255,255,255,0.85);
      --sidebar-muted: rgba(255,255,255,0.45);
      display: grid;
      grid-template-columns: 220px 1fr;
      width: 100%;
      max-width: 860px;
      min-height: 1100px;
      background: #fff;
      font-family: 'DM Sans', sans-serif;
      margin: 0 auto;
    }

    /* ── Sidebar ── */
    .cv-sidebar {
      background: #111827;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .cv-sidebar::before {
      content: '';
      position: absolute;
      top: -40px; left: -40px;
      width: 200px; height: 200px;
      background: ${accent};
      opacity: 0.18;
      border-radius: 50%;
    }
    .cv-sidebar::after {
      content: '';
      position: absolute;
      bottom: 60px; right: -50px;
      width: 140px; height: 140px;
      background: ${accent};
      opacity: 0.1;
      border-radius: 50%;
    }
    .cv-sidebar__top {
      display: flex; flex-direction: column; align-items: center;
      padding: 36px 20px 24px; text-align: center; position: relative; z-index: 1;
    }
    .cv-avatar-ring {
      width: 84px; height: 84px; border-radius: 50%; padding: 3px;
      background: linear-gradient(135deg, ${accent}, rgba(255,255,255,0.3));
      margin-bottom: 14px;
    }
    .cv-avatar {
      width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
      border: 2px solid #111827; display: block;
    }
    .cv-name {
      font-family: 'DM Serif Display', serif; font-size: 18px;
      color: #fff; margin: 0 0 6px; line-height: 1.2;
    }
    .cv-titre {
      font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
      text-transform: uppercase; color: ${accent}; margin: 0;
    }
    .cv-section-side {
      padding: 18px 20px;
      border-top: 1px solid rgba(255,255,255,0.07);
      position: relative; z-index: 1;
    }
    .cv-section-side__title {
      font-size: 10px; font-weight: 700; letter-spacing: 0.15em;
      text-transform: uppercase; color: ${accent}; margin: 0 0 12px;
    }

    /* Contact */
    .cv-contact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .cv-contact-list li { display: flex; align-items: center; gap: 8px; font-size: 11px; color: rgba(255,255,255,0.85); word-break: break-all; }
    .cv-contact-icon { flex-shrink: 0; display: flex; align-items: center; color: ${accent}; }

    /* Skills */
    .cv-skills-list { display: flex; flex-direction: column; gap: 9px; }
    .cv-skill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .cv-skill-name { font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 500; }
    .cv-skill-pct { font-size: 10px; color: rgba(255,255,255,0.45); }
    .cv-skill-bar { height: 3px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; }
    .cv-skill-fill { height: 100%; background: ${accent}; border-radius: 2px; }

    /* Formation */
    .cv-formation-item { display: flex; gap: 10px; margin-bottom: 10px; }
    .cv-formation-annee { font-size: 10px; font-weight: 700; color: ${accent}; min-width: 32px; padding-top: 1px; }
    .cv-formation-diplome { font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 600; margin: 0 0 2px; }
    .cv-formation-etab { font-size: 10px; color: rgba(255,255,255,0.45); margin: 0; }

    /* ── Main ── */
    .cv-main {
      padding: 36px 32px; display: flex; flex-direction: column; gap: 28px; background: #fff;
    }
    .cv-bio {
      padding: 16px 20px;
      background: ${accentLight};
      border-left: 3px solid ${accent};
      border-radius: 0 8px 8px 0;
    }
    .cv-bio p { font-size: 13px; color: #374151; line-height: 1.6; margin: 0; font-style: italic; }

    /* Section titles */
    .cv-section-main__title {
      display: flex; align-items: center; gap: 10px;
      font-family: 'DM Serif Display', serif; font-size: 15px; color: #111; margin: 0 0 16px;
    }
    .cv-section-main__line { flex: 1; height: 1px; background: ${accent}; opacity: 0.25; }
    .cv-section-main__title .cv-section-main__line:first-child {
      flex: 0.1; background: ${accent}; opacity: 1; height: 2px; border-radius: 1px;
    }

    /* Expériences */
    .cv-exp-item { margin-bottom: 16px; padding-left: 14px; border-left: 2px solid #e5e7eb; position: relative; }
    .cv-exp-item::before {
      content: ''; position: absolute; left: -5px; top: 5px;
      width: 8px; height: 8px; border-radius: 50%; background: ${accent};
    }
    .cv-exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .cv-exp-poste { font-size: 13px; font-weight: 700; color: #111; margin: 0; }
    .cv-exp-ent { color: ${accent}; font-weight: 600; }
    .cv-exp-periode { font-size: 11px; color: #9ca3af; margin: 2px 0 6px; }
    .cv-exp-desc { font-size: 12px; color: #4b5563; line-height: 1.5; margin: 0; }

    /* Projets */
    .cv-projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .cv-project-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; position: relative; overflow: hidden; }
    .cv-project-card__accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 10px 10px 0 0; }
    .cv-project-name { font-size: 12px; font-weight: 700; color: #111; margin: 8px 0 3px; }
    .cv-project-stack { font-size: 10px; color: ${accent}; font-weight: 600; margin: 0 0 5px; }
    .cv-project-desc { font-size: 11px; color: #6b7280; margin: 0; line-height: 1.4; }

    /* Langues */
    .cv-langues { display: flex; gap: 12px; flex-wrap: wrap; }
    .cv-langue-item { display: flex; align-items: center; gap: 8px; }
    .cv-langue-name { font-size: 13px; font-weight: 600; color: #111; }
    .cv-langue-level {
      font-size: 10px; font-weight: 600; padding: 3px 9px;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .cv-langue-level--native { background: ${accentBadge}; color: ${accent}; }
    .cv-langue-level--pro { background: #f3f4f6; color: #6b7280; }

    /* ── Print rules ── */
    @page { size: A4; margin: 8mm; }
    @media print {
      body { margin: 0; }
      .cv-paper { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  ${cvHTML}
</body>
</html>`;
  }

  /** Convertit un hex en rgba() pour remplacer color-mix() */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}