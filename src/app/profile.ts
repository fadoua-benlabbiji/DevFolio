import { Injectable, signal, computed, inject } from '@angular/core';
import { Profile } from './profile.model';
import { UserService } from './user';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private userService = inject(UserService);
  private _profiles = signal<Profile[]>(MOCK_PROFILES);
  readonly profiles = this._profiles.asReadonly();

  // ✅ myProfile basé sur l'utilisateur connecté (plus hardcodé sur id=1)
  readonly myProfile = computed(() => {
    const u = this.userService.currentUser();
    if (!u) return MOCK_PROFILES[0];
    return this._profiles().find(p => p.id === u.profileId) ?? MOCK_PROFILES[0];
  });

  // ── Ajouter un nouveau profil (appelé depuis l'inscription) ──
  addProfile(profile: Profile): void {
    this._profiles.update(list => [...list, profile]);
  }

  // ✅ updateProfile existant (conservé)
  updateProfile(updatedProfile: Profile): void {
    this._profiles.update(list =>
      list.map(p => p.id === updatedProfile.id ? updatedProfile : p)
    );
  }

  // ✅ update(id, changes) — appelé depuis vue-ensemble pour l'avatar
  update(id: number, changes: Partial<Profile>): void {
    this._profiles.update(list =>
      list.map(p => p.id === id ? { ...p, ...changes } : p)
    );
  }

  getAll(): Profile[] {
    return this._profiles();
  }

  getById(id: number): Profile | undefined {
    return this._profiles().find(p => p.id === id);
  }

  getBySkill(skill: string): Profile[] {
    return this._profiles().filter(p => p.skills.includes(skill));
  }

  search(query: string): Profile[] {
    const q = query.toLowerCase();
    return this._profiles().filter(p =>
      p.nom.toLowerCase().includes(q) ||
      p.titre.toLowerCase().includes(q) ||
      p.ville.toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    );
  }
}

const MOCK_PROFILES: Profile[] = [
  {
    id: 1,
    nom: 'Lina Bensalem',
    username: 'lina-dev',
    email: 'lina@example.com',
    titre: 'Développeuse Full Stack',
    bio: 'Passionnée par Angular, Node.js et les architectures scalables.',
    ville: 'Casablanca',
    projets: 12,
    featured: true,
    avatar: 'https://i.pravatar.cc/80?img=12',
    skills: ['Angular', 'Node.js', 'MongoDB', 'TypeScript'],
    github: '#',
    linkedin: '#',
    website: '#',
  },
  {
    id: 2,
    nom: 'Sara Bennani',
    username: 'sara-bennani',
    email: 'sara@example.com',
    titre: 'Frontend Engineer',
    bio: "Spécialisée en UI/UX et React. J'aime créer des interfaces accessibles.",
    ville: 'Rabat',
    projets: 8,
    featured: false,
    avatar: 'https://i.pravatar.cc/80?img=32',
    skills: ['React', 'TypeScript', 'CSS', 'Figma'],
    github: '#',
    linkedin: '#',
    website: '#',
  },
  {
    id: 3,
    nom: 'Mehdi Tazi',
    username: 'mehdi-tazi',
    email: 'mehdi@example.com',
    titre: 'DevOps & Backend',
    bio: 'Docker, Kubernetes et NestJS sont mes outils du quotidien.',
    ville: 'Marrakech',
    projets: 15,
    featured: true,
    avatar: 'https://i.pravatar.cc/80?img=53',
    skills: ['NestJS', 'Docker', 'PostgreSQL', 'AWS'],
    github: '#',
    linkedin: '#',
    website: '#',
  },
  {
    id: 4,
    nom: 'Nadia Chraibi',
    username: 'nadia-chraibi',
    email: 'nadia@example.com',
    titre: 'Data Scientist',
    bio: 'Machine learning et visualisation de données. Python avant tout.',
    ville: 'Fès',
    projets: 6,
    featured: false,
    avatar: 'https://i.pravatar.cc/80?img=44',
    skills: ['Python', 'TensorFlow', 'React', 'MongoDB'],
    github: '#',
    linkedin: '#',
    website: '#',
  },
  {
    id: 5,
    nom: 'Amine Kabbaj',
    username: 'amine-kabbaj',
    email: 'amine@example.com',
    titre: 'Mobile Developer',
    bio: 'React Native et Flutter pour des apps mobiles performantes.',
    ville: 'Agadir',
    projets: 9,
    featured: false,
    avatar: 'https://i.pravatar.cc/80?img=61',
    skills: ['React', 'TypeScript', 'Node.js', 'Firebase'],
    github: '#',
    linkedin: '#',
    website: '#',
  },
  {
    id: 6,
    nom: 'Fatima Zahrae',
    username: 'fatima-zahrae',
    email: 'fatima@example.com',
    titre: 'UI/UX & Angular Dev',
    bio: 'Je transforme des maquettes Figma en composants Angular propres.',
    ville: 'Tanger',
    projets: 11,
    featured: true,
    avatar: 'https://i.pravatar.cc/80?img=25',
    skills: ['Angular', 'TypeScript', 'CSS', 'Figma'],
    github: '#',
    linkedin: '#',
    website: '#',
  },
  {
    id: 7,
    nom: 'Omar Alaoui',
    username: 'omar-alaoui',
    email: 'omar@example.com',
    titre: 'Architecte Logiciel',
    bio: 'DDD, microservices et clean architecture sont mes domaines de prédilection.',
    ville: 'Casablanca',
    projets: 20,
    featured: false,
    avatar: 'https://i.pravatar.cc/80?img=67',
    skills: ['NestJS', 'PostgreSQL', 'Docker', 'AWS'],
    github: '#',
    linkedin: '#',
    website: '#',
  },
  {
    id: 8,
    nom: 'Kenza Moussaoui',
    username: 'kenza-moussaoui',
    email: 'kenza@example.com',
    titre: 'Fullstack Freelance',
    bio: 'Mon stack favori : Angular + NestJS + PostgreSQL. Disponible pour missions.',
    ville: 'Rabat',
    projets: 14,
    featured: false,
    avatar: 'https://i.pravatar.cc/80?img=9',
    skills: ['Angular', 'NestJS', 'PostgreSQL', 'TypeScript'],
    github: '#',
    linkedin: '#',
    website: '#',
  },
];