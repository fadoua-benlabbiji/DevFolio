import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-connextion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connextion {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  errorMsg = '';

  constructor(private router: Router, private auth: AuthService) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.errorMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }
    
    const result = this.auth.login(this.email, this.password);
    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.errorMsg = result.error || 'Erreur de connexion';
    }
  }
}
