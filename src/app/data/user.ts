import { Injectable, signal, computed } from '@angular/core';

//les interfaces

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

export interface UserProfile {
  userId: number;
  username: string;
  titre: string;  //developpeur full stack
  bio: string;
  ville: string;
  avatar: string;
  github: string;
  linkedin: string;
  website: string;
  accentColor: string;
  skills: string[];        
}

export interface Education {
  id: number;
  userId: number;
  diplome: string;
  etablissement: string;
  debut: string;
  fin: string;
}

export interface Language {
  id: number;
  userId: number;
  nom: string;
  niveau: 'Natif' | 'Courant' | 'Professionnel' | 'Intermédiaire' | 'Débutant';
}


const MOCK_USERS: User[] = [
  { id: 1, nom: 'Bensalem', prenom: 'Lina',  email: 'lina@example.com',  password: 'Lina@1234'  },
  { id: 2, nom: 'Bennani',  prenom: 'Sara',  email: 'sara@example.com',  password: 'Sara@5678'  },
  { id: 3, nom: 'Tazi',     prenom: 'Mehdi', email: 'mehdi@example.com', password: 'Mehdi@9012' },
];

const MOCK_PROFILES: UserProfile[] = [
  {
    userId: 1, username: 'lina-dev',
    titre: 'Développeuse Full Stack',
    bio: 'Passionnée par Angular, Node.js et les architectures scalables.',
    ville: 'Casablanca', 
    avatar: 'https://i.pravatar.cc/80?img=12',
    skills: ['Angular', 'Node.js', 'MongoDB', 'TypeScript'],
    github: '#', linkedin: '#', website: '#', accentColor: '#F5C518',
  },
  {
    userId: 2, username: 'sara-bennani',
    titre: 'Frontend Engineer',
    bio: "Spécialisée en UI/UX et React. J'aime créer des interfaces accessibles.",
    ville: 'Rabat', 
    avatar: 'https://i.pravatar.cc/80?img=32',
    skills: ['React', 'TypeScript', 'CSS', 'Figma'],
    github: '#', linkedin: '#', website: '#', accentColor: '#3b82f6',
  },
  {
    userId: 3, username: 'mehdi-tazi',
    titre: 'Backend Engineer',
    bio: 'Spécialiste NestJS, Docker et AWS.',
    ville: 'Marrakech',
    avatar: 'https://i.pravatar.cc/80?img=60',
    skills: ['NestJS', 'Docker', 'PostgreSQL', 'AWS'],
    github: '#', linkedin: '#', website: '#', accentColor: '#e879f9',
  },
];

const MOCK_EDUCATIONS: Education[] = [
  { id: 1, userId: 1, diplome: 'Licence en Informatique', etablissement: 'Université Hassan II', debut: '2020', fin: '2023' },
  { id: 2, userId: 1, diplome: 'Master Génie Logiciel',   etablissement: 'ENSIAS',               debut: '2023', fin: 'En cours' },
];

const MOCK_LANGUAGES: Language[] = [
  { id: 1, userId: 1, nom: 'Français', niveau: 'Natif' },
  { id: 2, userId: 1, nom: 'Anglais',  niveau: 'Professionnel' },
  { id: 3, userId: 1, nom: 'Arabe',    niveau: 'Natif' },
];



@Injectable({ providedIn: 'root' })
export class UserService {

  public currentUser = signal<User | null>(this.chargerStorage());

  public isLoggedIn  = computed(() => this.currentUser() !== null);

  private chargerStorage(): User | null {
    try {
      const userS= localStorage.getItem('currentUser');
      return userS ? JSON.parse(userS) as User : null; //force le type
    } catch {
      return null;
    }
  }

  login(email: string, password: string): User | null {
    const trouve = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (trouve) {
      this.currentUser.set(trouve);
      localStorage.setItem('currentUser', JSON.stringify(trouve));
    }
    return trouve ?? null;  //trouve==undefined ou null
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  register(data: { prenom: string; nom: string; email: string; password: string }): User {
    const newUser: User = { id: Date.now(), ...data };
    MOCK_USERS.push(newUser);
    //creation d un profile vide
    MOCK_PROFILES.push({
      userId: newUser.id, 
      username: data.prenom.toLowerCase(),
      titre: '', 
      bio: '', 
      ville: '', 
      avatar: '', 
      skills: [], 
      github: '', 
      linkedin: '', 
      website: '',
      accentColor: '#F5C518',
    });
    return newUser;
  }

  getByEmail(email: string): User | undefined {
    return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public profiles = signal<UserProfile[]>(MOCK_PROFILES);


  public myProfile = computed<UserProfile | null>(() => {
    const u = this.currentUser();
    return u ? (this.profiles().find(p => p.userId === u.id) ?? null) : null;
  });

  updateMyProfile(changes: Partial<UserProfile>): void { //rend tout les champs optionnels
    const u = this.currentUser();
    if (!u) return;   
    this.profiles.update(list =>
      list.map(p => p.userId === u.id ? { ...p, ...changes } : p) //spread operator  {object,changement}
    );
  }

  getProfileByUserId(userId: number): UserProfile | undefined {
    return this.profiles().find(p => p.userId === userId);
  }

  getAllProfiles(): UserProfile[] {
    return this.profiles();
  }

  searchProfiles(texttape: string): UserProfile[] {
    const q = texttape.toLowerCase();
    return this.profiles().filter(p =>
      p.username.toLowerCase().includes(q) || //contains
      p.titre.toLowerCase().includes(q) ||
      p.ville.toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))  //true si au moins une existe
    );
  }

  //formation
  private _educations = signal<Education[]>(MOCK_EDUCATIONS);

  public myEducations = computed(() => {
    const u = this.currentUser();  //user ou null
    return u ? this._educations().filter(e => e.userId === u.id) : [];
  });
  //on prend l interface mais on supprime certains champs
  addEducation(edu: Omit<Education, 'id' | 'userId'>): void {
    const u = this.currentUser();
    if (!u) return;
    //tableau ancien + objet
    this._educations.update(list => [...list, { ...edu, id: Date.now(), userId: u.id }]);
  }

  updateEducation(id: number, changes: Partial<Education>): void {
    this._educations.update(list => list.map(e => e.id === id ? { ...e, ...changes } : e));
  }

  removeEducation(id: number): void {
    this._educations.update(list => list.filter(e => e.id !== id));
  }

  //language
  private _languages = signal<Language[]>(MOCK_LANGUAGES);

  public myLanguages = computed(() => {
    const u = this.currentUser();
    return u ? this._languages().filter(l => l.userId === u.id) : [];
  });

  addLanguage(lang: Omit<Language, 'id' | 'userId'>): void {
    const u = this.currentUser();
    if (!u) return;
    this._languages.update(list => [...list, { ...lang, id: Date.now(), userId: u.id }]);
  }

  updateLanguage(id: number, changes: Partial<Language>): void {
    this._languages.update(list => list.map(l => l.id === id ? { ...l, ...changes } : l));
  }

  removeLanguage(id: number): void {
    this._languages.update(list => list.filter(l => l.id !== id));
  }

  //mot de passe
  changePassword(currentPwd: string, newPwd: string): boolean {
    const u = this.currentUser();
    if (!u) return false;
    const trouve = MOCK_USERS.find(mu => mu.id === u.id);
    if (!trouve || trouve.password !== currentPwd) return false;
    trouve.password = newPwd;
    //mettre a jour le signal
    const updated = { ...u, password: newPwd };
    this.currentUser.set(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
    return true;
  }
  getProfileByUsername(username: string): UserProfile | null {
  return this.getAllProfiles().find(p => p.username === username) ?? null;

 }
 
   getEducationsByUserId(userId: number): Education[] {
    return this._educations().filter(e => e.userId === userId);
  }
    getLanguagesByUserId(userId: number): Language[] {
    return this._languages().filter(l => l.userId === userId);
  }
}