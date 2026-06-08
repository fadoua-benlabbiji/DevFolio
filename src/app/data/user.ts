import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'currentUser';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  profileId: number;
  avatar?: string;
}

const MOCK_USERS: User[] = [
  { id: 1, nom: 'Bensalem', prenom: 'Lina',  email: 'lina@example.com',  password: 'Lina@1234',  profileId: 1 },
  { id: 2, nom: 'Bennani',  prenom: 'Sara',  email: 'sara@example.com',  password: 'Sara@5678',  profileId: 2 },
  { id: 3, nom: 'Tazi',     prenom: 'Mehdi', email: 'mehdi@example.com', password: 'Mehdi@9012', profileId: 3 },
];

@Injectable({ providedIn: 'root' })
export class UserService {

  // ← Charge l'utilisateur depuis localStorage au démarrage
  private _currentUser = signal<User | null>(this._loadFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn  = computed(() => this._currentUser() !== null);

  // ── Chargement depuis localStorage ───────────────────────────────────────
  private _loadFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) as User : null;
    } catch {
      return null;
    }
  }

  // ── Connexion ─────────────────────────────────────────────────────────────
  login(email: string, password: string): User | null {
    const found = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      this._currentUser.set(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
    return found ?? null;
  }

  // ── Déconnexion ───────────────────────────────────────────────────────────
  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  // ── Inscription ───────────────────────────────────────────────────────────
  register(data: { prenom: string; nom: string; email: string; password: string }): User {
    const newUser: User = {
      id: Date.now(),
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      password: data.password,
      profileId: Date.now(),
    };
    MOCK_USERS.push(newUser);
    return newUser;
  }

  // ── Utilitaires ───────────────────────────────────────────────────────────
  getByEmail(email: string): User | undefined {
    return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
}