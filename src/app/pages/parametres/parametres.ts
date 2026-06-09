import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, Education, Language } from '../../data/user';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.html',
  styleUrl: './parametres.css',
})
export class Parametres implements OnInit {

  private userSvc = inject(UserService);

  readonly currentUser = this.userSvc.currentUser;
  saved = signal(false);

  // ── Champs profil ─────────────────────────────────────────────────────────
  username    = signal('');
  titre       = signal('');
  bio         = signal('');
  email       = signal('');
  ville       = signal('');
  github      = signal('');
  linkedin    = signal('');
  website     = signal('');
  accentColor = signal('#F5C518');

  // Avatar : stocké en base64 (upload fichier)
  avatarData  = signal<string>('');

  // ── Changement de mot de passe ────────────────────────────────────────────
  showPasswordForm  = signal(false);
  currentPassword   = signal('');
  newPassword       = signal('');
  confirmPassword   = signal('');
  passwordError     = signal('');
  passwordSuccess   = signal(false);

  // ── Formations ────────────────────────────────────────────────────────────
  readonly educations = this.userSvc.myEducations;

  eduForm = signal<{ id: number | null; diplome: string; etablissement: string; debut: string; fin: string }>({
    id: null, diplome: '', etablissement: '', debut: '', fin: '',
  });
  showEduForm = signal(false);

  // ── Langues ───────────────────────────────────────────────────────────────
  readonly languages = this.userSvc.myLanguages;

  langForm = signal<{ id: number | null; nom: string; niveau: Language['niveau'] }>({
    id: null, nom: '', niveau: 'Intermédiaire',
  });
  showLangForm = signal(false);

  readonly niveaux: Language['niveau'][] = ['Natif', 'Courant', 'Professionnel', 'Intermédiaire', 'Débutant'];

  // ── Complétude ────────────────────────────────────────────────────────────
  readonly profileCompleteness = computed(() => {
    let score = 0;
    if (this.avatarData())  score += 20;
    if (this.username())    score += 20;
    if (this.titre())       score += 20;
    if (this.bio())         score += 20;
    if (this.ville())       score += 20;
    return score;
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const p = this.userSvc.myProfile();
    if (!p) return;
    this.avatarData.set(p.avatar  ?? '');
    this.username.set(p.username  ?? '');
    this.titre.set(p.titre        ?? '');
    this.bio.set(p.bio            ?? '');
    this.email.set(this.userSvc.currentUser()?.email ?? '');
    this.ville.set(p.ville        ?? '');
    this.github.set(p.github      ?? '');
    this.linkedin.set(p.linkedin  ?? '');
    this.website.set(p.website    ?? '');
    this.accentColor.set(p.accentColor ?? '#F5C518');
  }

  // ── Avatar upload ──────────────────────────────────────────────────────────
  triggerAvatarUpload(): void {
    (document.getElementById('param-avatar-input') as HTMLInputElement)?.click();
  }

  onAvatarFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.avatarData.set(base64);
      // Sauvegarder immédiatement dans le profil
      this.userSvc.updateMyProfile({ avatar: base64 });
    };
    reader.readAsDataURL(input.files[0]);
  }

  // ── Sauvegarde profil ─────────────────────────────────────────────────────
  save(): void {
    this.userSvc.updateMyProfile({
      avatar:      this.avatarData(),
      username:    this.username(),
      titre:       this.titre(),
      bio:         this.bio(),
      ville:       this.ville(),
      github:      this.github(),
      linkedin:    this.linkedin(),
      website:     this.website(),
      accentColor: this.accentColor(),
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  // ── Changement mot de passe ───────────────────────────────────────────────
  togglePasswordForm(): void {
    this.showPasswordForm.update(v => !v);
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordError.set('');
    this.passwordSuccess.set(false);
  }

  submitPasswordChange(): void {
    this.passwordError.set('');
    if (!this.currentPassword()) {
      this.passwordError.set('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (this.newPassword().length < 6) {
      this.passwordError.set('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Les mots de passe ne correspondent pas.');
      return;
    }
    const ok = this.userSvc.changePassword(this.currentPassword(), this.newPassword());
    if (!ok) {
      this.passwordError.set('Mot de passe actuel incorrect.');
      return;
    }
    this.passwordSuccess.set(true);
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    setTimeout(() => {
      this.passwordSuccess.set(false);
      this.showPasswordForm.set(false);
    }, 2500);
  }

  // ── CRUD Formations ───────────────────────────────────────────────────────
  openAddEdu(): void {
    this.eduForm.set({ id: null, diplome: '', etablissement: '', debut: '', fin: '' });
    this.showEduForm.set(true);
  }

  openEditEdu(edu: Education): void {
    this.eduForm.set({ id: edu.id, diplome: edu.diplome, etablissement: edu.etablissement, debut: edu.debut, fin: edu.fin });
    this.showEduForm.set(true);
  }

  cancelEdu(): void { this.showEduForm.set(false); }

  saveEdu(): void {
    const f = this.eduForm();
    if (!f.diplome.trim() || !f.etablissement.trim()) return;
    if (f.id !== null) {
      this.userSvc.updateEducation(f.id, { diplome: f.diplome, etablissement: f.etablissement, debut: f.debut, fin: f.fin });
    } else {
      this.userSvc.addEducation({ diplome: f.diplome, etablissement: f.etablissement, debut: f.debut, fin: f.fin });
    }
    this.showEduForm.set(false);
  }

  deleteEdu(id: number): void { this.userSvc.removeEducation(id); }

  setEduField(field: 'diplome' | 'etablissement' | 'debut' | 'fin', value: string): void {
    this.eduForm.update(f => ({ ...f, [field]: value }));
  }

  // ── CRUD Langues ──────────────────────────────────────────────────────────
  openAddLang(): void {
    this.langForm.set({ id: null, nom: '', niveau: 'Intermédiaire' });
    this.showLangForm.set(true);
  }

  openEditLang(lang: Language): void {
    this.langForm.set({ id: lang.id, nom: lang.nom, niveau: lang.niveau });
    this.showLangForm.set(true);
  }

  cancelLang(): void { this.showLangForm.set(false); }

  saveLang(): void {
    const f = this.langForm();
    if (!f.nom.trim()) return;
    if (f.id !== null) {
      this.userSvc.updateLanguage(f.id, { nom: f.nom, niveau: f.niveau });
    } else {
      this.userSvc.addLanguage({ nom: f.nom, niveau: f.niveau });
    }
    this.showLangForm.set(false);
  }

  deleteLang(id: number): void { this.userSvc.removeLanguage(id); }

  setLangField(field: 'nom' | 'niveau', value: string): void {
    this.langForm.update(f => ({ ...f, [field]: value as Language['niveau'] }));
  }
}