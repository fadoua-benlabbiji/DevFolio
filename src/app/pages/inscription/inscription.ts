import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../data/user';

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
  errorMsg = '';

  constructor(
    private router: Router,
    private userService: UserService,
  ) {}



  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  register(): void {
    this.errorMsg = '';
    //remplissage des champs
    if (!this.prenom || !this.nom || !this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const existUser = this.userService.getByEmail(this.email);
    if (existUser) {
      this.errorMsg = 'Un compte avec cet email existe déjà.';
      return;
    }

    const newUser = this.userService.register({
      prenom: this.prenom,
      nom: this.nom,
      email: this.email,
      password: this.password,
    });

    // Connexion pour storage
    this.userService.login(newUser.email, newUser.password);

    // Redirection vers le dashboard
    this.router.navigate(['/dashboard']);
  }
}
