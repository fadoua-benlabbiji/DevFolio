import { Injectable, signal } from '@angular/core';

export interface User {
  id: number;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  avatar: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<User | null>({
    id: 1,
    prenom: 'Lina',
    nom: 'Bensalem',
    username: '@lina-dev',
    email: 'lina@example.com',
    avatar: 'https://i.pravatar.cc/80?img=12'
  });

  readonly currentUser = this._currentUser.asReadonly();

  login(email: string, password: string): { success: boolean; error?: string } {
    if (email && password) {
      this._currentUser.set({
        id: 1,
        prenom: 'Lina',
        nom: 'Bensalem',
        username: '@lina-dev',
        email,
        avatar: 'https://i.pravatar.cc/80?img=12'
      });
      return { success: true };
    }
    return { success: false, error: 'Email ou mot de passe incorrect.' };
  }

  logout(): void {
    this._currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this._currentUser() !== null;
  }
}
