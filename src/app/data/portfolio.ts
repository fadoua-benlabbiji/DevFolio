import { Injectable, signal, computed, inject } from '@angular/core';
import { UserService } from './user';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  userId: number;
  name: string;
  description: string;
  pct: number;
  color: string;
  readme?: string;
  technologies: string[];
  url?: string;
  github?: string;
  demo?: string;
  image?: string;
  images?: string[];
  logo?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
  features?: string[];
  impact?: string;
}

export interface Skill {
  id: number;
  userId: number;
  name: string;
  pct: number;
  color: string;
  category: string;
  logo?: string;
}

export interface Experience {
  id: number;
  userId: number;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
}

export interface Message {
  id: number;
  fromUserId: number;   // userId de l'expéditeur
  toUserId: number;     // userId du destinataire
  fromName: string;     // nom affiché
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  private userSvc = inject(UserService);

  // ── Projets ───────────────────────────────────────────────────────────────
  private _projects = signal<Project[]>([
    {
      id: 1, userId: 1,
      name: 'E-commerce Platform',
      technologies: ['Angular', 'Node.js', 'Express', 'MongoDB', 'Stripe', 'Socket.io', 'JWT', 'Docker'],
      pct: 100, color: '#F5C518',
      description: 'Plateforme e-commerce complète avec panier, paiement et gestion des stocks.',
      github: '#', demo: '#',
      role: 'Développeur Full Stack',
      startDate: 'Jan 2024', endDate: 'Jun 2024',
      readme: 'Une plateforme e-commerce moderne construite avec Angular 17 côté frontend et Node.js/Express côté backend.',
      features: [
        'Authentification JWT avec refresh tokens',
        'Panier dynamique avec persistance localStorage',
        'Intégration Stripe pour les paiements sécurisés',
        'Dashboard admin avec gestion des produits et stocks',
        'Notifications en temps réel avec Socket.io',
      ],
      impact: 'Réduction de 40% du temps de traitement des commandes.',
    },
    {
      id: 2, userId: 1,
      name: 'Analytics Dashboard',
      technologies: ['React', 'TypeScript', 'D3.js', 'Recharts', 'jsPDF', 'WebSocket', 'TailwindCSS'],
      pct: 100, color: '#3b82f6',
      description: 'Dashboard analytique avec graphiques interactifs et exports PDF.',
      github: '#', demo: '#',
      role: 'Frontend Developer',
      startDate: 'Mar 2024', endDate: 'Mai 2024',
      readme: 'Dashboard de visualisation de données construit avec React et D3.js.',
      features: [
        'Graphiques interactifs avec D3.js (line, bar, pie)',
        'Export PDF et CSV des rapports',
        'Données en temps réel via WebSocket',
      ],
      impact: 'Gain de 3h/semaine grâce à l\'automatisation des rapports PDF.',
    },
    {
      id: 3, userId: 1,
      name: 'Auth Microservice',
      technologies: ['NestJS', 'PostgreSQL', 'JWT', 'Passport.js', 'Redis', 'TypeORM', 'Docker'],
      pct: 78, color: '#a78bfa',
      description: 'Service d\'authentification avec OAuth2, refresh tokens et 2FA.',
      github: '#',
      role: 'Backend Developer',
      startDate: 'Avr 2024',
    },
    {
      id: 4, userId: 2,
      name: 'Portfolio V2',
      technologies: ['Angular', 'SCSS', 'Firebase'],
      pct: 100, color: '#22c55e',
      description: 'Portfolio conçu avec Angular 17 et déployé sur Firebase.',
      demo: '#',
    },
    {
      id: 5, userId: 2,
      name: 'Chat App',
      technologies: ['React', 'Socket.io', 'Redis'],
      pct: 45, color: '#fb923c',
      description: 'Application de chat en temps réel avec rooms et notifications.',
    },
    {
      id: 6, userId: 3,
      name: 'API Gateway',
      technologies: ['NestJS', 'Docker', 'AWS'],
      pct: 100, color: '#e879f9',
      description: 'Gateway centralisée pour microservices avec rate limiting et logging.',
      github: '#', demo: '#',
    },
  ]);

  readonly myProjects = computed(() => {
    const uid = this.userSvc.currentUser()?.id;
    return uid ? this._projects().filter(p => p.userId === uid) : [];
  });

  addProject(p: Omit<Project, 'id' | 'userId'>): void {
    const uid = this.userSvc.currentUser()?.id;
    if (!uid) return;
    this._projects.update(list => [...list, { ...p, id: Date.now(), userId: uid }]);
  }

  updateProject(id: number, changes: Partial<Project>): void {
    this._projects.update(list => list.map(p => p.id === id ? { ...p, ...changes } : p));
  }

  removeProject(id: number): void {
    this._projects.update(list => list.filter(p => p.id !== id));
  }

  getProjectById(id: number): Project | undefined {
    return this._projects().find(p => p.id === id);
  }

  getProjectsByUserId(userId: number): Project[] {
    return this._projects().filter(p => p.userId === userId);
  }

  // ── Compétences ───────────────────────────────────────────────────────────
  private _skills = signal<Skill[]>([
    { id: 1,  userId: 1, name: 'Angular',    pct: 92, color: '#F5C518', category: 'Frontend' },
    { id: 2,  userId: 1, name: 'TypeScript', pct: 88, color: '#3b82f6', category: 'Langage' },
    { id: 3,  userId: 1, name: 'Node.js',    pct: 75, color: '#22c55e', category: 'Backend' },
    { id: 4,  userId: 1, name: 'MongoDB',    pct: 60, color: '#34d399', category: 'Base de données' },
    { id: 5,  userId: 2, name: 'React',      pct: 70, color: '#60a5fa', category: 'Frontend' },
    { id: 6,  userId: 2, name: 'TypeScript', pct: 85, color: '#3b82f6', category: 'Langage' },
    { id: 7,  userId: 2, name: 'CSS',        pct: 90, color: '#e879f9', category: 'Frontend' },
    { id: 8,  userId: 3, name: 'NestJS',     pct: 72, color: '#e879f9', category: 'Backend' },
    { id: 9,  userId: 3, name: 'Docker',     pct: 58, color: '#fb923c', category: 'DevOps' },
    { id: 10, userId: 3, name: 'PostgreSQL', pct: 65, color: '#a78bfa', category: 'Base de données' },
  ]);

  readonly mySkills = computed(() => {
    const uid = this.userSvc.currentUser()?.id;
    return uid ? this._skills().filter(s => s.userId === uid) : [];
  });

  addSkill(s: Omit<Skill, 'id' | 'userId'>): void {
    const uid = this.userSvc.currentUser()?.id;
    if (!uid) return;
    this._skills.update(list => [...list, { ...s, id: Date.now(), userId: uid }]);
  }

  updateSkill(id: number, changes: Partial<Skill>): void {
    this._skills.update(list => list.map(s => s.id === id ? { ...s, ...changes } : s));
  }

  deleteSkill(id: number): void {
    this._skills.update(list => list.filter(s => s.id !== id));
  }

  // ── Expériences ───────────────────────────────────────────────────────────
  private _experiences = signal<Experience[]>([]);

  readonly myExperiences = computed(() => {
    const uid = this.userSvc.currentUser()?.id;
    return uid ? this._experiences().filter(e => e.userId === uid) : [];
  });

  addExperience(e: Omit<Experience, 'id' | 'userId'>): void {
    const uid = this.userSvc.currentUser()?.id;
    if (!uid) return;
    this._experiences.update(list => [...list, { ...e, id: Date.now(), userId: uid }]);
  }

  updateExperience(id: number, changes: Partial<Experience>): void {
    this._experiences.update(list => list.map(e => e.id === id ? { ...e, ...changes } : e));
  }

  removeExperience(id: number): void {
    this._experiences.update(list => list.filter(e => e.id !== id));
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  private _messages = signal<Message[]>([
    {
      id: 1, fromUserId: 0, toUserId: 1,
      fromName: 'TechCorp RH',
      subject: 'Opportunité Angular Senior',
      body: 'Bonjour, nous avons découvert votre portfolio et nous aimerions vous proposer un poste d\'Angular Senior. Êtes-vous disponible pour un entretien ?',
      date: '2026-06-03', read: false,
    },
    {
      id: 2, fromUserId: 0, toUserId: 1,
      fromName: 'StartupXYZ',
      subject: 'Mission freelance Angular',
      body: 'Nous cherchons un développeur Angular pour une mission de 3 mois. Notre projet concerne une plateforme SaaS B2B.',
      date: '2026-06-02', read: true,
    },
    {
      id: 3, fromUserId: 0, toUserId: 1,
      fromName: 'OpenSource Maroc',
      subject: 'Invitation contributeur',
      body: 'Rejoignez notre communauté open source ! Nous avons besoin de votre expertise Angular pour plusieurs projets.',
      date: '2026-05-30', read: true,
    },
    {
      id: 4, fromUserId: 1, toUserId: 0,
      fromName: 'Lina Bensalem',
      subject: 'Re: Mission freelance Angular',
      body: 'Bonjour, merci pour votre message. Je suis effectivement disponible pour une mission freelance. Pouvez-vous me donner plus de détails sur le projet ?',
      date: '2026-06-02', read: true,
    },
  ]);

  /** Messages reçus par l'utilisateur connecté */
  readonly receivedMessages = computed(() => {
    const uid = this.userSvc.currentUser()?.id;
    return uid ? this._messages().filter(m => m.toUserId === uid) : [];
  });

  /** Messages envoyés par l'utilisateur connecté */
  readonly sentMessages = computed(() => {
    const uid = this.userSvc.currentUser()?.id;
    return uid ? this._messages().filter(m => m.fromUserId === uid) : [];
  });

  readonly unreadCount = computed(() =>
    this.receivedMessages().filter(m => !m.read).length
  );

  markAsRead(id: number): void {
    this._messages.update(list => list.map(m => m.id === id ? { ...m, read: true } : m));
  }

  deleteMessage(id: number): void {
    this._messages.update(list => list.filter(m => m.id !== id));
  }

  sendMessage(msg: Omit<Message, 'id' | 'fromUserId' | 'fromName' | 'date' | 'read'>): void {
    const u = this.userSvc.currentUser();
    if (!u) return;
    const newMsg: Message = {
      ...msg,
      id: Date.now(),
      fromUserId: u.id,
      fromName: `${u.prenom} ${u.nom}`,
      date: new Date().toISOString().slice(0, 10),
      read: true,
    };
    this._messages.update(list => [...list, newMsg]);
  }
}
