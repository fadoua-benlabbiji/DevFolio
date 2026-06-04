import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../user'; // ← ajustez le chemin
import { ProfileService } from '../../profile';
@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Inscription {
  prenom = '';
  nom = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  acceptTerms = false;
  errorMsg = '';
 
  constructor(
    private router: Router,
    private userService: UserService,
    private profileService: ProfileService
  ) {}
 
  get pwStrength(): number {
    const p = this.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }
 
  get pwStrengthWidth(): string {
    const map = [0, 33, 66, 100, 100];
    return map[this.pwStrength] + '%';
  }
 
  get pwStrengthClass(): string {
    if (this.pwStrength <= 1) return 'weak';
    if (this.pwStrength <= 2) return 'medium';
    return 'strong';
  }
 
  get pwStrengthLabel(): string {
    if (this.pwStrength <= 1) return 'Faible';
    if (this.pwStrength <= 2) return 'Moyen';
    return 'Fort';
  }
 
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
 
  register(): void {
    this.errorMsg = '';
 
    // Validations
    if (!this.prenom || !this.nom || !this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.password.length < 8) {
      this.errorMsg = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    if (!this.acceptTerms) {
      this.errorMsg = "Vous devez accepter les conditions d'utilisation.";
      return;
    }
 
    // Vérifier si l'email existe déjà
    const existingUser = this.userService.getByEmail(this.email);
    if (existingUser) {
      this.errorMsg = 'Un compte avec cet email existe déjà.';
      return;
    }
 
    // 1 — Créer l'utilisateur dans UserService
    const newUser = this.userService.register({
      prenom: this.prenom,
      nom: this.nom,
      email: this.email,
      password: this.password,
    });
 
    // 2 — Créer le profil associé dans ProfileService
    this.profileService.addProfile({
      id: newUser.id,
      nom: `${this.prenom} ${this.nom}`,
      username: `${this.prenom.toLowerCase()}-${this.nom.toLowerCase()}`,
      email: this.email,
      titre: 'Nouveau membre',
      bio: '',
      ville: '',
      projets: 0,
      featured: false,
      avatar: '',
      skills: [],
      github: '#',
      linkedin: '#',
      website: '#',
    });
 
    // 3 — Connexion automatique
    this.userService.login(newUser.email, newUser.password);
 
    // 4 — Redirection vers le dashboard
    this.router.navigate(['/dashboard']);
  }
}
 