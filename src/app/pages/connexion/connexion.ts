import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UserService} from '../../data/user';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  errorMsg = '';
  isLoading = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
  this.errorMsg = '';

  if (!this.email || !this.password) {
    this.errorMsg = 'Veuillez remplir tous les champs.';
    return;
  }

  const user = this.userService.login(this.email, this.password);

  if (user) {
    this.router.navigate(['/dashboard']);
  } else {
    this.errorMsg = 'Email ou mot de passe incorrect.';
  }
}}