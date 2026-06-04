import { Injectable, signal, computed } from '@angular/core';
const STORAGE_KEY = 'currentUser';
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  profileId: number; // lien vers le profil correspondant
}

const MOCK_USERS: User[] = [
  {
    id: 1,
    nom: 'Bensalem',
    prenom: 'Lina',
    email: 'lina@example.com',
    password: 'Lina@1234',
    profileId: 1,
  },
  {
    id: 2,
    nom: 'Bennani',
    prenom: 'Sara',
    email: 'sara@example.com',
    password: 'Sara@5678',
    profileId: 2,
  },
  {
    id: 3,
    nom: 'Tazi',
    prenom: 'Mehdi',
    email: 'mehdi@example.com',
    password: 'Mehdi@9012',
    profileId: 3,
  },
];

@Injectable({ providedIn: 'root' })
export class UserService {
  private _currentUser = signal<User | null>(null);

  // Utilisateur connecté (lecture seule depuis l'extérieur)
  readonly currentUser = this._currentUser.asReadonly();

  // Retourne true si quelqu'un est connecté
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  /**
   * Tente de connecter un utilisateur avec email + mot de passe.
   * Retourne l'utilisateur si trouvé, null sinon.
   */
  login(email: string, password: string): User | null {
    const found = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );
    if (found) {
      
      this._currentUser.set(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found)); // ← sauvegarde dans localStorage
    }
    return found ?? null;
  }

  /**
   * Déconnecte l'utilisateur courant.
   */
  logout(): void {
    this._currentUser.set(null);
  }

  /**
   * Récupère un utilisateur par son email (utile pour réinitialisation, etc.).
   */
  getByEmail(email: string): User | undefined {
    return MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }
  register(data: { prenom: string; nom: string; email: string; password: string }): User {
  const newUser: User = {
    id: Date.now(),
    prenom: data.prenom,
    nom: data.nom,
    email: data.email,
    password: data.password,
    profileId: Date.now(), // profileId temporaire
  };
  MOCK_USERS.push(newUser);
  return newUser;
}
}