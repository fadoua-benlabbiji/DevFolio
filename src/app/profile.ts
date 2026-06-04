import { Injectable, signal, computed } from '@angular/core'; // Importez computed
import { Profile } from './profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private _profiles = signal<Profile[]>(MOCK_PROFILES);
  readonly profiles = this._profiles.asReadonly();

  // AJOUTEZ CECI pour corriger l'erreur TS2551
  readonly myProfile = computed(() => this._profiles().find(p => p.id === 1) || MOCK_PROFILES[0]);

  // AJOUTEZ CECI pour corriger l'erreur TS2339
  updateProfile(updatedProfile: Profile): void {
    this._profiles.update(list => 
      list.map(p => p.id === updatedProfile.id ? updatedProfile : p)
    );
  }
  getAll(): Profile[] {
    return this._profiles();
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
 // Exemple pour le premier profil dans MOCK_PROFILES
{
  id: 1, 
  nom: 'Lina Bensalem', 
  username: 'lina-dev',        // Ajoutez ceci
  email: 'lina@example.com',   // Ajoutez ceci
  titre: 'Développeuse Full Stack',
  bio: 'Passionnée par Angular, Node.js et les architectures scalables.',
  ville: 'Casablanca', 
  projets: 12, 
  featured: true,
  avatar: 'https://i.pravatar.cc/80?img=12',
  skills: ['Angular', 'Node.js', 'MongoDB', 'TypeScript'],
  github: '#',
  linkedin: '#',
  website: '#'
},
  {
    id: 2, nom: 'Sara Bennani', titre: 'Frontend Engineer',
    bio: "Spécialisée en UI/UX et React. J'aime créer des interfaces accessibles.",
    ville: 'Rabat', projets: 8, featured: false,
    avatar: 'https://i.pravatar.cc/80?img=32',
    skills: ['React', 'TypeScript', 'CSS', 'Figma']
  },
  {
    id: 3, nom: 'Mehdi Tazi', titre: 'DevOps & Backend',
    bio: 'Docker, Kubernetes et NestJS sont mes outils du quotidien.',
    ville: 'Marrakech', projets: 15, featured: true,
    avatar: 'https://i.pravatar.cc/80?img=53',
    skills: ['NestJS', 'Docker', 'PostgreSQL', 'AWS']
  },
  {
    id: 4, nom: 'Nadia Chraibi', titre: 'Data Scientist',
    bio: 'Machine learning et visualisation de données. Python avant tout.',
    ville: 'Fès', projets: 6, featured: false,
    avatar: 'https://i.pravatar.cc/80?img=44',
    skills: ['Python', 'TensorFlow', 'React', 'MongoDB']
  },
  {
    id: 5, nom: 'Amine Kabbaj', titre: 'Mobile Developer',
    bio: 'React Native et Flutter pour des apps mobiles performantes.',
    ville: 'Agadir', projets: 9, featured: false,
    avatar: 'https://i.pravatar.cc/80?img=61',
    skills: ['React', 'TypeScript', 'Node.js', 'Firebase']
  },
  {
    id: 6, nom: 'Fatima Zahrae', titre: 'UI/UX & Angular Dev',
    bio: 'Je transforme des maquettes Figma en composants Angular propres.',
    ville: 'Tanger', projets: 11, featured: true,
    avatar: 'https://i.pravatar.cc/80?img=25',
    skills: ['Angular', 'TypeScript', 'CSS', 'Figma']
  },
  {
    id: 7, nom: 'Omar Alaoui', titre: 'Architecte Logiciel',
    bio: 'DDD, microservices et clean architecture sont mes domaines de prédilection.',
    ville: 'Casablanca', projets: 20, featured: false,
    avatar: 'https://i.pravatar.cc/80?img=67',
    skills: ['NestJS', 'PostgreSQL', 'Docker', 'AWS']
  },
  {
    id: 8, nom: 'Kenza Moussaoui', titre: 'Fullstack Freelance',
    bio: 'Mon stack favori : Angular + NestJS + PostgreSQL. Disponible pour missions.',
    ville: 'Rabat', projets: 14, featured: false,
    avatar: 'https://i.pravatar.cc/80?img=9',
    skills: ['Angular', 'NestJS', 'PostgreSQL', 'TypeScript']
  }
];