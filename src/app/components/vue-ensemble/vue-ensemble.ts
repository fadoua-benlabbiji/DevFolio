import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
  private router         = inject(Router);

  today = '';

  user: { name: string; initials: string; avatar: string | null } = {
    name: '', initials: '', avatar: null,
  };

  readonly skills   = this.portfolio.mySkills;
  readonly projects = this.portfolio.myProjects;

  stats: { label: string; value: string }[] = [];

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

    this.stats = [
      { label: 'Projets réalisés', value: String(this.portfolio.myProjects().length) },
      { label: 'Compétences',      value: String(this.portfolio.mySkills().length)   },
      { label: 'Messages non lus', value: String(this.portfolio.unreadCount())       },
    ];
  }

  triggerAvatarUpload(): void {
    const input = document.getElementById('avatar-upload') as HTMLInputElement;
    input?.click();
  }

onAvatarChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    this.avatarPreview.set(base64);
    this.user = { ...this.user, avatar: base64 };

    const u = this.userService.currentUser();
    if (u) {
      // ✅ Met à jour ProfileService (déjà là)
      const profile = this.profileService.getById(u.profileId);
      if (profile) {
        this.profileService.update(u.profileId, { ...profile, avatar: base64 });
      }

      // ✅ AJOUTE : met à jour aussi PortfolioService
      this.portfolio.updateProfile({ avatar: base64 });
    }
  };
  reader.readAsDataURL(input.files[0]);
}

async generateCV(): Promise<void> {
  const u = this.userService.currentUser();
  const projects = this.portfolio.myProjects().filter(p => p.pct === 100).slice(0, 3);
  const skills = this.portfolio.mySkills();
  const accent = '#2563eb';
  const accentLight = this.hexToRgba(accent, 0.08);
  const accentBadge = this.hexToRgba(accent, 0.12);

  const skillsHTML = skills.map(s => `
    <div class="cv-skill-item">
      <div class="cv-skill-header">
        <span class="cv-skill-name">${s.name}</span>
        <span class="cv-skill-pct">${s.pct}%</span>
      </div>
      <div class="cv-skill-bar">
        <div class="cv-skill-fill" style="width:${s.pct}%"></div>
      </div>
    </div>
  `).join('');

  const projectsHTML = projects.map(p => `
    <div class="cv-project-card">
      <div class="cv-project-card__accent" style="background:${p.color}"></div>
      <h4 class="cv-project-name">${p.name}</h4>
      <p class="cv-project-stack">${(p.technologies ?? []).join(' · ')}</p>
      <p class="cv-project-desc">${p.description}</p>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CV — ${u?.prenom ?? ''} ${u?.nom ?? ''}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .cv-paper { --accent: ${accent}; display: grid; grid-template-columns: 220px 1fr; width: 100%; max-width: 860px; min-height: 1100px; background: #fff; font-family: 'DM Sans', sans-serif; margin: 0 auto; }
    .cv-sidebar { background: #111827; display: flex; flex-direction: column; position: relative; overflow: hidden; }
    .cv-sidebar::before { content: ''; position: absolute; top: -40px; left: -40px; width: 200px; height: 200px; background: ${accent}; opacity: 0.18; border-radius: 50%; }
    .cv-sidebar::after { content: ''; position: absolute; bottom: 60px; right: -50px; width: 140px; height: 140px; background: ${accent}; opacity: 0.1; border-radius: 50%; }
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
    .cv-exp-item { margin-bottom: 16px; padding-left: 14px; border-left: 2px solid #e5e7eb; position: relative; }
    .cv-exp-item::before { content: ''; position: absolute; left: -5px; top: 5px; width: 8px; height: 8px; border-radius: 50%; background: ${accent}; }
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
<body>
  <div class="cv-paper">
    <aside class="cv-sidebar">
      <div class="cv-sidebar__top">
        <h2 class="cv-name">${u?.prenom ?? ''}<br>${u?.nom ?? ''}</h2>
        <p class="cv-titre">Développeur Full-Stack</p>
      </div>
      <div class="cv-section-side">
        <h3 class="cv-section-side__title">Contact</h3>
        <ul class="cv-contact-list">
          <li><span class="cv-contact-icon">✉</span>${u?.email ?? ''}</li>
          <li><span class="cv-contact-icon">📍</span>Casablanca, Maroc</li>
        </ul>
      </div>
      <div class="cv-section-side">
        <h3 class="cv-section-side__title">Compétences</h3>
        <div class="cv-skills-list">${skillsHTML}</div>
      </div>
      <div class="cv-section-side">
        <h3 class="cv-section-side__title">Formation</h3>
        <div class="cv-formation-item">
          <span class="cv-formation-annee">2021</span>
          <div>
            <p class="cv-formation-diplome">Master Informatique</p>
            <p class="cv-formation-etab">ENSIAS Rabat</p>
          </div>
        </div>
        <div class="cv-formation-item">
          <span class="cv-formation-annee">2019</span>
          <div>
            <p class="cv-formation-diplome">Licence Génie Logiciel</p>
            <p class="cv-formation-etab">Université Hassan II</p>
          </div>
        </div>
      </div>
    </aside>
    <main class="cv-main">
      <section class="cv-bio">
        <p>Passionnée par les interfaces élégantes et les architectures propres. Je conçois des applications web performantes avec Angular, React, Node.js et PostgreSQL.</p>
      </section>
      <section class="cv-section-main">
        <h3 class="cv-section-main__title">
          <span class="cv-section-main__line"></span>
          Expériences
          <span class="cv-section-main__line"></span>
        </h3>
        <div class="cv-exp-item">
          <h4 class="cv-exp-poste">Développeuse Full-Stack — <span class="cv-exp-ent">TechNova</span></h4>
          <p class="cv-exp-periode">2023 — présent</p>
          <p class="cv-exp-desc">Développement d'applications SaaS B2B avec React et Node.js.</p>
        </div>
        <div class="cv-exp-item">
          <h4 class="cv-exp-poste">Développeuse Frontend — <span class="cv-exp-ent">WebStudio</span></h4>
          <p class="cv-exp-periode">2021 — 2023</p>
          <p class="cv-exp-desc">Intégration d'interfaces responsives et optimisation des performances web.</p>
        </div>
      </section>
      <section class="cv-section-main">
        <h3 class="cv-section-main__title">
          <span class="cv-section-main__line"></span>
          Projets Clés
          <span class="cv-section-main__line"></span>
        </h3>
        <div class="cv-projects-grid">${projectsHTML}</div>
      </section>
      <section class="cv-section-main">
        <h3 class="cv-section-main__title">
          <span class="cv-section-main__line"></span>
          Langues
          <span class="cv-section-main__line"></span>
        </h3>
        <div class="cv-langues">
          <div class="cv-langue-item"><span class="cv-langue-name">Français</span><span class="cv-langue-level cv-langue-level--native">Natif</span></div>
          <div class="cv-langue-item"><span class="cv-langue-name">Anglais</span><span class="cv-langue-level cv-langue-level--pro">Professionnel</span></div>
          <div class="cv-langue-item"><span class="cv-langue-name">Arabe</span><span class="cv-langue-level cv-langue-level--native">Natif</span></div>
        </div>
      </section>
    </main>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  };
}

private hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
}